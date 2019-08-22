/* global document, localStorage */
import React, { useEffect } from 'react';
import useClipboardReducer from 'AppHooks/clipboardReducer';
import Snackbar from 'ui/Snackbar';
import ucFirst from 'AppUtils/ucFirst';
import splitCamelCase from 'AppUtils/splitCamelCase';
import { Button } from 'react-mdl';
import { MdClose } from 'react-icons/md';
import ClipboardPasteBtn from './ClipboardPasteBtn';

const ClipboardWrapper = ({ children }) => {
  const [
    { copiedData, onSuccess, onFailure, accept, destination },
    dispatchClipboardActions,
    { pasteClipboardData, getClipboardData, clearClipboardData, ...clipboardActions }
  ] = useClipboardReducer();

  const _onSuccess = response => {
    if (onSuccess) onSuccess(response);
    clearClipboardData();
    dispatchClipboardActions(clipboardActions.updateState({
      copiedData: null
    }));
  };

  useEffect(() => {
    const onPaste = e => {
      if (e.ctrlKey && (e.key === 'v')) {
        const data = getClipboardData();

        if (destination && data && (accept || []).includes(data.dataType)) {
          pasteClipboardData(destination)
            .then(onSuccess)
            .catch(onFailure);
        }
      }
    };

    document.addEventListener('keyup', onPaste, true);

    return () => {
      document.removeEventListener('keyup', onPaste, true);
    };
  });

  return (
    <React.Fragment>
      {!copiedData ? null :
        <Snackbar className="ui__flex ui__alignItems_center">
          <span>{ucFirst(splitCamelCase(copiedData.dataType).toLowerCase())} copied</span>&nbsp;
          <ClipboardPasteBtn onSuccess={_onSuccess} onFailure={onFailure}>
            <Button
              disabled={!(accept || []).includes(copiedData.dataType)}
            >Paste</Button>
          </ClipboardPasteBtn>&nbsp;
          <div
            className="ui__cursor_pointer ui__flex ui__alignItems_center"
            onClick={() => {
              clearClipboardData();
              dispatchClipboardActions(clipboardActions.updateState({
                copiedData: null
              }));
            }}
          ><MdClose /></div>
        </Snackbar>}

      {children}
    </React.Fragment>
  );
};

export default ClipboardWrapper;
