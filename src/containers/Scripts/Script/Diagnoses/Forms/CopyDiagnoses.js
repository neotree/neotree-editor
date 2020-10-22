import React from 'react';
import { useDiagnosesContext } from '@/contexts/diagnoses';
import { useScriptContext } from '@/contexts/script';
import CopyScriptItems from '../../CopyScriptItems';

const CopyDiagnoses = React.forwardRef((props, ref) => {
  const { state: { script } } = useScriptContext();
  const { setState: setDiagnosesState } = useDiagnosesContext();
  
  return (
    <>
      <CopyScriptItems
        {...props}
        ref={ref}
        type="diagnosis"
        onSuccess={(items, scriptId) => {
          if (scriptId === script.scriptId) {
            setDiagnosesState(s => ({ diagnoses: [...s.diagnoses, ...items] }));
          }
        }}
      />
    </>
  );
});

export default CopyDiagnoses;
