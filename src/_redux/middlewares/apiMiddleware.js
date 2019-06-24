/*eslint-disable no-console*/
import postData from './postData';

export const API_MIDDLEWARE = (/*store*/) => (next) => (action) => {
  if (!(action.POST || action.GET)) return next(action);

  const API_METHOD = action.GET ? 'GET' : 'POST';

  const { types, name, payload } = action[API_METHOD];
  const { requestType, successType, failureType } = types;
  payload.redirect = payload.redirect || {};
  const {
    redirect,
    onSuccess,
    onFailure,
    onResponse,
    addResponseToState,
    ..._payload
  } = payload;

  next({
    type: requestType,
    payload: _payload,
    name
  });
  
  postData(`/${name}`, _payload, API_METHOD)
    .then(r => {
      if (onResponse) onResponse(r);
      if (!r.ok) return { error: { msg: 'Ooops, something went wrong' } };
      if (r.redirected) {
        global.window.location = r.url;
        return next({ type: 'FORCING_REDIRECT' });
      }
      return r.json();
    }).then(response => {
      if (response.redirectURL && response.refresh) {
        global.window.location = response.redirectURL;
        return next({ type: 'FORCING_REDIRECT' });
      }

      if (response.error || response.errors) {
        next({
          type: failureType,
          ...(response.error ? { error: response.error } : {}),
          ...(response.errors ? { error: response.errors } : {}),
          redirectURL: redirect,
          name,
          displayLoader: false
        });
        if (onFailure) onFailure(response.error);
        return;
      }

      if (response.redirectURL) {
        const { redirectURL, msg, ..._response } = response;
        return next({
          type: successType,
          redirectURL,
          msg,
          response: _response
        });
      }

      next({
        name,
        type: successType,
        redirectURL: redirect.setOnSuccess ?
          redirect.setOnSuccess(response) : (redirect.success || null),
        response: response.payload,
        ...(addResponseToState ? { addResponseToState } : {})
      });
      if (onSuccess) onSuccess(response, _payload);
    }).catch(error => {
      if (onResponse) onResponse({ error });
      next({
        type: failureType,
        error,
        name,
        redirectURL: redirect.setOnFailure ?
          redirect.setOnFailure(error) : (redirect.failure || null),
      });
    if (onFailure) onFailure(error);
    });
};
