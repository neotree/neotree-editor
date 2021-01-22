/* global window */
import React from 'react';
import { useParams } from 'react-router-dom';
import CopyScriptItems from '../../CopyScriptItems';

const CopyDiagnoses = React.forwardRef((props, ref) => {
  const { scriptId } = useParams();
  
  return (
    <>
      <CopyScriptItems
        {...props}
        ref={ref}
        type="diagnosis"
        onSuccess={(items, _scriptId) => {
          if (scriptId === _scriptId) window.location.reload();
        }}
      />
    </>
  );
});

export default CopyDiagnoses;
