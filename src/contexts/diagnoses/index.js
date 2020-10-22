import React from 'react';
import useRouter from '@/utils/useRouter';
import * as defaults from './_defaults';

export const DiagnosesContext = React.createContext(null);

export const useDiagnosesContext = () => React.useContext(DiagnosesContext);

export const provideDiagnosesContext = Component => function DiagnosesContextProvider(props) {
  const router = useRouter();
  const [state, _setState] = React.useState(defaults.defaultState);

  const value = new (class DiagnosesContextValue {
    state = state;

    _setState = _setState;

    router = router;

    defaults = defaults;

    setState = s => this._setState(prevState => ({
      ...prevState,
      ...(typeof s === 'function' ? s(prevState) : s)
    }));

    deleteDiagnoses = require('./_deleteDiagnoses').default.bind(this);

    duplicateDiagnoses = require('./_duplicateDiagnoses').default.bind(this);

    getDiagnoses = require('./_getDiagnoses').default.bind(this);

    updateDiagnoses = require('./_updateDiagnoses').default.bind(this);
  })();

  const { scriptId } = value.router.match.params;

  React.useEffect(() => { value.getDiagnoses({ scriptId }); }, [scriptId]);

  return (
    <DiagnosesContext.Provider
      value={value}
    >
      <Component {...props} />
    </DiagnosesContext.Provider>
  );
};
