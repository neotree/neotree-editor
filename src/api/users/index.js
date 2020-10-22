import makeApiCall from '../makeApiCall';

export const getUsers = (reqPayload = {}, reqOpts) => {
  return makeApiCall('/get-users', {
    body: reqPayload,
    ...reqOpts,
  });
};

export const deleteUsers = (reqPayload = {}, reqOpts) => {
  return makeApiCall('/delete-users', {
    method: 'POST',
    body: reqPayload,
    ...reqOpts,
  });
};

export const addUser = (reqPayload = {}, reqOpts) => {
  return makeApiCall('/add-user', {
    method: 'POST',
    body: reqPayload,
    ...reqOpts,
  });
};

export const updateUser = (reqPayload = {}, reqOpts) => {
  return makeApiCall('/update-user', {
    method: 'POST',
    body: reqPayload,
    ...reqOpts,
  });
};
