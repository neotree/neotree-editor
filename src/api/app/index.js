import makeApiCall from '../makeApiCall';

export const initialiseApp = (reqPayload = {}, reqOpts) => {
  return makeApiCall('/app/init', {
    body: reqPayload,
    ...reqOpts,
  });
};
