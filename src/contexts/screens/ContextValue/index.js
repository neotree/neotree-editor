import React from 'react';
import Value, { defaults } from './Value';

export default props => {
  const [state, setState] = React.useState(defaults.defaultState);

  return new Value({
    props,
    state,
    setState,
  });
};
