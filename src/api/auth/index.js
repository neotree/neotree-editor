import makeApiCall from '../makeApiCall';

export const checkEmailRegistration = (reqPayload = {}, reqOpts) => {
  return makeApiCall('/check-email-registration', {
    body: reqPayload,
    ...reqOpts,
  });
};
