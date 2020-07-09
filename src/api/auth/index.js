import makeApiCall from '../makeApiCall';

export const checkEmailRegistration = (reqPayload = {}, reqOpts) => {
  return makeApiCall('/check-email-registration', {
    body: reqPayload,
    ...reqOpts,
  });
};

export const authenticate = (authType, reqPayload = {}, reqOpts) => {
  return makeApiCall(`/${authType}`, {
    method: 'POST',
    body: reqPayload,
    ...reqOpts,
  });
};

export const signOut = (authType, reqPayload = {}, reqOpts) => {
  return makeApiCall('/logout', {
    body: reqPayload,
    ...reqOpts,
  });
};
