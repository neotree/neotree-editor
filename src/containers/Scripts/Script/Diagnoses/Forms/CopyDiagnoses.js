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
        onSuccess={(items, script_id) => {
          if (script_id === script.scriptId) {
            setDiagnosesState(s => ({ diagnoses: [...s.diagnoses, ...items] }));
          }
        }}
      />
    </>
  );
});

export default CopyDiagnoses;
