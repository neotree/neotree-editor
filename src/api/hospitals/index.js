import makeApiCall from '../makeApiCall';

export const getHospitals = (reqPayload = {}, reqOpts) => {
  return makeApiCall('/get-hospitals', {
    body: reqPayload,
    ...reqOpts,
  });
};

export const deleteHospitals = (reqPayload = {}, reqOpts) => {
  return makeApiCall('/delete-hospitals', {
    method: 'POST',
    body: reqPayload,
    ...reqOpts,
  });
};

export const addHospital = (reqPayload = {}, reqOpts) => {
  return makeApiCall('/add-hospital', {
    method: 'POST',
    body: reqPayload,
    ...reqOpts,
  });
};

export const updateHospital = (reqPayload = {}, reqOpts) => {
  return makeApiCall('/update-hospital', {
    method: 'POST',
    body: reqPayload,
    ...reqOpts,
  });
};
