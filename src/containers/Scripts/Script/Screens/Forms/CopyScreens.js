import React from 'react';
import { useScreensContext } from '@/contexts/screens';
import { useScriptContext } from '@/contexts/script';
import CopyScriptItems from '../../CopyScriptItems';

const CopyScreens = React.forwardRef((props, ref) => {
  const { state: { script } } = useScriptContext();
  const { setState: setScreensState } = useScreensContext();
  
  return (
    <>
      <CopyScriptItems
        {...props}
        ref={ref}
        type="screen"
        onSuccess={(items, script_id) => {
          if (script_id === script.id) {
            setScreensState(s => ({ screens: [...s.screens, ...items] }));
          }
        }}
      />
    </>
  );
});

export default CopyScreens;
