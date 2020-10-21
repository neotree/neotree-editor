import makeApiCall from '../makeApiCall';

export const getScreens = (reqPayload = {}, reqOpts) => {
  return makeApiCall('/get-screens', {
    body: reqPayload,
    ...reqOpts,
  });
};

export const updateScreens = (reqPayload = {}, reqOpts) => {
  return makeApiCall('/update-screens', {
    method: 'POST',
    body: reqPayload,
    ...reqOpts,
  });
};

export const deleteScreens = (reqPayload = {}, reqOpts) => {
  return makeApiCall('/delete-screens', {
    method: 'POST',
    body: reqPayload,
    ...reqOpts,
  });
};

export const duplicateScreens = (reqPayload = {}, reqOpts) => {
  return makeApiCall('/duplicate-screens', {
    method: 'POST',
    body: reqPayload,
    ...reqOpts,
  });
};

export const getScreen = (reqPayload = {}, reqOpts) => {
  return makeApiCall('/get-screen', {
    body: reqPayload,
    ...reqOpts,
  });
};

export const updateScreen = (reqPayload = {}, reqOpts) => {
  return makeApiCall('/update-screen', {
    method: 'POST',
    body: reqPayload,
    ...reqOpts,
  });
};

export const createScreen = (reqPayload = {}, reqOpts) => {
  return makeApiCall('/create-screen', {
    method: 'POST',
    body: reqPayload,
    ...reqOpts,
  });
};
