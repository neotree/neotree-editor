import makeApiCall from '../makeApiCall';

export const getDiagnoses = (reqPayload = {}, reqOpts) => {
  return makeApiCall('/get-diagnoses', {
    body: reqPayload,
    ...reqOpts,
  });
};

export const updateDiagnoses = (reqPayload = {}, reqOpts) => {
  return makeApiCall('/update-diagnoses', {
    method: 'POST',
    body: reqPayload,
    ...reqOpts,
  });
};

export const deleteDiagnoses = (reqPayload = {}, reqOpts) => {
  return makeApiCall('/delete-diagnoses', {
    method: 'POST',
    body: reqPayload,
    ...reqOpts,
  });
};

export const duplicateDiagnoses = (reqPayload = {}, reqOpts) => {
  return makeApiCall('/duplicate-diagnoses', {
    method: 'POST',
    body: reqPayload,
    ...reqOpts,
  });
};

export const getDiagnosis = (reqPayload = {}, reqOpts) => {
  return makeApiCall('/get-diagnosis', {
    body: reqPayload,
    ...reqOpts,
  });
};

export const updateDiagnosis = (reqPayload = {}, reqOpts) => {
  return makeApiCall('/update-diagnosis', {
    method: 'POST',
    body: reqPayload,
    ...reqOpts,
  });
};

export const createDiagnosis = (reqPayload = {}, reqOpts) => {
  return makeApiCall('/create-diagnosis', {
    method: 'POST',
    body: reqPayload,
    ...reqOpts,
  });
};
