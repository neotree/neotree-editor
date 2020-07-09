import makeApiCall from '../makeApiCall';

export const initialiseApp = (reqPayload = {}, reqOpts) => {
  return makeApiCall('/initialise-app', {
    body: reqPayload,
    ...reqOpts,
  });
};

export const getApiKey = (reqPayload = {}, reqOpts) => {
  return makeApiCall('/api/key', {
    body: reqPayload,
    ...reqOpts,
  });
};

export const generateApiKey = (reqPayload = {}, reqOpts) => {
  return makeApiCall('/api/generate-key', {
    method: 'POST',
    body: reqPayload,
    ...reqOpts,
  });
};

export const exportToFirebase = (reqPayload = {}, reqOpts) => {
  return makeApiCall('/export-to-firebase', {
    method: 'POST',
    body: reqPayload,
    ...reqOpts,
  });
};

export const importFirebase = (reqPayload = {}, reqOpts) => {
  return makeApiCall('/import-firebase', {
    method: 'POST',
    body: reqPayload,
    ...reqOpts,
  });
};
