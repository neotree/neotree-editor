import makeApiCall from '../makeApiCall';

export const getScripts = (reqPayload = {}, reqOpts) => {
  return makeApiCall('/get-scripts', {
    body: reqPayload,
    ...reqOpts,
  });
};

export const deleteScripts = (reqPayload = {}, reqOpts) => {
  return makeApiCall('/delete-scripts', {
    method: 'POST',
    body: reqPayload,
    ...reqOpts,
  });
};

export const updateScripts = (reqPayload = {}, reqOpts) => {
  return makeApiCall('/update-scripts', {
    method: 'POST',
    body: reqPayload,
    ...reqOpts,
  });
};

export const copyScripts = (reqPayload = {}, reqOpts) => {
  return makeApiCall('/copy-scripts', {
    method: 'POST',
    body: reqPayload,
    ...reqOpts,
  });
};
