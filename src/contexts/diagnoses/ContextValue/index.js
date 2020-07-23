import React from 'react';
import useRouter from '@/utils/useRouter';
import Value, { defaults } from './Value';

export default props => {
  const router = useRouter();
  const [state, setState] = React.useState(defaults.defaultState);

  return new Value({
    props,
    state,
    router,
    setState,
  });
};
