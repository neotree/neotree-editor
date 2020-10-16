import makeApiCall from '../makeApiCall';

export const getHospitals = (reqPayload = {}, reqOpts) => {
  return makeApiCall('/get-hospitals', {
    body: reqPayload,
    ...reqOpts,
  });
};

export const deleteHospital = (reqPayload = {}, reqOpts) => {
  return makeApiCall('/delete-hospital', {
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
