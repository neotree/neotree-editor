import createSharedState from '../createSharedState';
import * as actions from './actions';

export { actions };

const initialState = {
  screens: [],
  screen: null
};

const reducer = (state = initialState, action) => {
  if (action.type === actions.UPDATE) {
    const newState = { ...state };
    return { ...state, ...(typeof action.partialState === 'function' ? action.partialState(newState) : action.partialState) };
  }
  return state;
};


export default createSharedState(reducer, initialState);
