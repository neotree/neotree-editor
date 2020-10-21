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

export const deleteScripts = (reqPayload = {}, reqOpts) => {
  return makeApiCall('/delete-scripts', {
    method: 'POST',
    body: reqPayload,
    ...reqOpts,
  });
};

export const duplicateScripts = (reqPayload = {}, reqOpts) => {
  return makeApiCall('/duplicate-scripts', {
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


export const createScript = (reqPayload = {}, reqOpts) => {
  return makeApiCall('/create-script', {
    method: 'POST',
    body: reqPayload,
    ...reqOpts,
  });
};

export const copyScreens = (reqPayload = {}, reqOpts) => {
  return makeApiCall('/copy-screens', {
    method: 'POST',
    body: reqPayload,
    ...reqOpts,
  });
};


export const copyDiagnoses = (reqPayload = {}, reqOpts) => {
  return makeApiCall('/copy-diagnoses', {
    method: 'POST',
    body: reqPayload,
    ...reqOpts,
  });
};
