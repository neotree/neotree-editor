import makeApiCall from '../makeApiCall';

export const getScripts = (reqPayload = {}, reqOpts) => {
  return makeApiCall('/get-scripts', {
    body: reqPayload,
    ...reqOpts,
  });
};
