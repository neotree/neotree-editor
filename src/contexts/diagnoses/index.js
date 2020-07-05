import React from 'react';
import { useParams } from 'react-router-dom';
import _getDiagnoses from './_getDiagnoses';
import _deleteDiagnoses from './_deleteDiagnoses';
import _updateDiagnoses from './_updateDiagnoses';
import _duplicateDiagnoses from './_duplicateDiagnoses';

export const DiagnosesContext = React.createContext(null);

export const useDiagnosesContext = () => React.useContext(DiagnosesContext);

export const provideDiagnosesContext = Component => function DiagnosesContextProvider(props) {
  const { scriptId, } = useParams();

  const [state, _setState] = React.useState({
    diagnoses: [],
  });
  const setState = s => _setState(prev => ({
    ...prev,
    ...typeof s === 'function' ? s(prev) : s
  }));

  const getDiagnoses = _getDiagnoses({ setState });
  const deleteDiagnoses = _deleteDiagnoses({ setState });
  const updateDiagnoses = _updateDiagnoses({ setState });
  const duplicateDiagnoses = _duplicateDiagnoses({ setState });

  React.useEffect(() => { getDiagnoses({ script_id: scriptId }); }, []);

  return (
    <DiagnosesContext.Provider
      value={{
        state,
        setState,
        _setState,
        getDiagnoses,
        deleteDiagnoses,
        updateDiagnoses,
        duplicateDiagnoses,
      }}
    >
      <Component {...props} />
    </DiagnosesContext.Provider>
  );
};
