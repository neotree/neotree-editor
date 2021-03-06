import makeApiCall from '../makeApiCall';

export const getConfigKeys = (reqPayload = {}, reqOpts) => {
  return makeApiCall('/get-config-keys', {
    body: reqPayload,
    ...reqOpts,
  });
};

export const updateConfigKeys = (reqPayload = {}, reqOpts) => {
  return makeApiCall('/update-config-keys', {
    method: 'POST',
    body: reqPayload,
    ...reqOpts,
  });
};

export const deleteConfigKeys = (reqPayload = {}, reqOpts) => {
  return makeApiCall('/delete-config-keys', {
    method: 'POST',
    body: reqPayload,
    ...reqOpts,
  });
};

export const duplicateConfigKeys = (reqPayload = {}, reqOpts) => {
  return makeApiCall('/duplicate-config-keys', {
    method: 'POST',
    body: reqPayload,
    ...reqOpts,
  });
};

export const updateConfigKey = (reqPayload = {}, reqOpts) => {
  return makeApiCall('/update-config-key', {
    method: 'POST',
    body: reqPayload,
    ...reqOpts,
  });
};


export const createConfigKey = (reqPayload = {}, reqOpts) => {
  return makeApiCall('/create-config-key', {
    method: 'POST',
    body: reqPayload,
    ...reqOpts,
  });
};
