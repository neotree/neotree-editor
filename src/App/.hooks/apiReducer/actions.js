export const UPDATE = 'UPDATE';
export const updateState = partialState => dispatch => dispatch({ type: UPDATE, partialState });
