/* global document, localStorage */
import React, { useEffect } from 'react';
import useClipboardReducer from 'AppHooks/clipboardReducer';

const ClipboardWrapper = ({ children }) => {
  const [
    clipboardState,
    dispatchClipboardActions, // eslint-disable-line
    { getClipboardData, pasteClipboardData }
  ] = useClipboardReducer();

  useEffect(() => {
    const onPaste = e => {
      if (e.ctrlKey && (e.key === 'v')) {
        const data = getClipboardData();
        const accept = clipboardState.accept || [];
        const { destination } = clipboardState;

        if (destination && data && accept.includes(data.dataType)) {
          pasteClipboardData(destination)
            .then(clipboardState.onSuccess)
            .catch(clipboardState.onFailure);
        }
      }
    };

    document.addEventListener('keyup', onPaste, true);

    return () => {
      document.removeEventListener('keyup', onPaste, true);
    };
  }, [clipboardState]);

  return (
    <React.Fragment>
      {children}
    </React.Fragment>
  );
};

export default ClipboardWrapper;
