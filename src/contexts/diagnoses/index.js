import React from 'react';
import useContextValue from './ContextValue';

export const DiagnosesContext = React.createContext(null);

export const useDiagnosesContext = () => React.useContext(DiagnosesContext);

export const provideDiagnosesContext = Component => function DiagnosesContextProvider(props) {
  const value = useContextValue();
  const { scriptId } = value.router.match.params;

  React.useEffect(() => { value.getDiagnoses({ script_id: scriptId }); }, [scriptId]);

  return (
    <DiagnosesContext.Provider
      value={value}
    >
      <Component {...props} />
    </DiagnosesContext.Provider>
  );
};
