import makeApiCall from '../makeApiCall';

export const getScripts = (reqPayload = {}, reqOpts) => {
  return makeApiCall('/get-scripts', {
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

export const deleteScript = (reqPayload = {}, reqOpts) => {
  return makeApiCall('/delete-script', {
    method: 'POST',
    body: reqPayload,
    ...reqOpts,
  });
};

export const duplicateScript = (reqPayload = {}, reqOpts) => {
  return makeApiCall('/duplicate-script', {
    method: 'POST',
    body: reqPayload,
    ...reqOpts,
  });
};

export const getScript = (reqPayload = {}, reqOpts) => {
  return makeApiCall('/get-script', {
    body: reqPayload,
    ...reqOpts,
  });
};

export const updateScript = (reqPayload = {}, reqOpts) => {
  return makeApiCall('/update-script', {
    method: 'POST',
    body: reqPayload,
    ...reqOpts,
  });
};
