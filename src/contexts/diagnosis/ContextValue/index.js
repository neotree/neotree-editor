import React from 'react';
import { useScriptContext } from '@/contexts/script';
import useRouter from '@/utils/useRouter';
import Value, { defaults } from './Value';

export default props => {
  const router = useRouter();
  const { state: { script } } = useScriptContext();

  const [state, setState] = React.useState({
    diagnosisSection: router.match.params.diagnosisSection || 'diagnoses',
    ...defaults.defaultState,
  });

  return new Value({
    router,
    props,
    state,
    setState,
    script,
  });
};
