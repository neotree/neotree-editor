import * as actions from '../actions';

const defaultState = {
  loading: 0,
  actions: []
};

export default (state = defaultState, action) => {
  const { type, name } = action;

  if (type === actions.API_REQUEST_REQUEST) {
    return {
      loading: state.loading + 1,
      actions: [...state.actions, name]
    };
  }

  if ((type === actions.API_REQUEST_SUCCESS)
    || (type === actions.API_REQUEST_FAILURE)) {
    const loading = state.loading - 1;
    return {
      loading: loading < 0 ? 0 : loading,
      actions: state.actions.filter(a => a !== name)
    };
  }

  return state;
};
