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

export const deleteConfigKey = (reqPayload = {}, reqOpts) => {
  return makeApiCall('/delete-config-key', {
    method: 'POST',
    body: reqPayload,
    ...reqOpts,
  });
};

export const duplicateConfigKey = (reqPayload = {}, reqOpts) => {
  return makeApiCall('/duplicate-config-key', {
    method: 'POST',
    body: reqPayload,
    ...reqOpts,
  });
};
