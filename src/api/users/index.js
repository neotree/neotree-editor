import makeApiCall from '../makeApiCall';

export const getUsers = (reqPayload = {}, reqOpts) => {
  return makeApiCall('/get-users', {
    body: reqPayload,
    ...reqOpts,
  });
};

export const deleteUser = (reqPayload = {}, reqOpts) => {
  return makeApiCall('/delete-user', {
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
