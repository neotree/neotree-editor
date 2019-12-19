/*eslint-disable no-console*/
import Api from 'AppUtils/Api';

export const API_MIDDLEWARE = (/*store*/) => next => action => {
  // const host = store.getState().$APP.host;
  if (!(action.POST || action.GET)) return next(action);

  const API_METHOD = action.GET ? 'get' : 'post';

  const { types, name, payload } = action[API_METHOD !== 'get' ? 'POST' : 'GET'];
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

  // Api[API_METHOD](`${host}/${name}`, _payload)
  Api[API_METHOD](`/${name}`, _payload)
    .then(response => {
      if (onResponse) onResponse(response);
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
