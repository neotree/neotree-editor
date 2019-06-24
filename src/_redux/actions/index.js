const updateState = type => (params = {}) => ({
  type,
  ...Object.assign(
    {},
    typeof params === 'function' ?
      { updater: params, payload: {} } : { payload: params }
  )
});

// UPDATE_API_DATA
export const UPDATE_API_DATA = 'UPDATE_API_DATA';
export const updateApiData = updateState(UPDATE_API_DATA);

// RESET_API_DATA
export const RESET_API_DATA = 'RESET_API_DATA';
export const resetApiData = () => ({
  type: RESET_API_DATA
});

// UPDATE_APP_STATUS
export const UPDATE_APP_STATUS = 'UPDATE_APP_STATUS';
export const updateAppStatus = updateState(UPDATE_APP_STATUS);

// RESET_APP_STATUS
export const RESET_APP_STATUS = 'RESET_APP_STATUS';
export const resetAppStatus = () => ({
  type: RESET_APP_STATUS
});

// API_REQUEST
export const API_REQUEST_REQUEST = 'API_REQUEST_REQUEST';
export const API_REQUEST_SUCCESS = 'API_REQUEST_SUCCESS';
export const API_REQUEST_FAILURE = 'API_REQUEST_FAILURE';
export const apiRequest = (apiType, name, payload = {}) => {
  const action = {};
  action[apiType] = {
    types: {
      requestType: API_REQUEST_REQUEST,
      successType: API_REQUEST_SUCCESS,
      failureType: API_REQUEST_FAILURE
    },
    name,
    payload: { ...payload }
  };
  return action;
};

// GET
export const get = (name, payload = {}) =>
  dispatch => dispatch(apiRequest('GET', name, payload));

// POST
export const post = (name, payload = {}) =>
  dispatch => dispatch(apiRequest('POST', name, payload));
