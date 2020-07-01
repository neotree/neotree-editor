import makeApiCall from '../makeApiCall';

export const initialiseApp = (reqPayload = {}, reqOpts) => {
  return makeApiCall('/initialise-app', {
    body: reqPayload,
    ...reqOpts,
  });
};
