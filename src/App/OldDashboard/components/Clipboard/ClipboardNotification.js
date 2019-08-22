import React from 'react';
import PropTypes from 'prop-types';
import useClipboardReducer from 'AppHooks/clipboardReducer';
import reduxComponent from 'reduxComponent';
import { withRouter } from 'react-router';
import Snackbar from 'ui/Snackbar';
import ucFirst from 'AppUtils/ucFirst';
import splitCamelCase from 'AppUtils/splitCamelCase';
import { Button } from 'react-mdl';
import { MdClose } from 'react-icons/md';
import ClipboardPasteBtn from './ClipboardPasteBtn';

const ClipboardPasteBox = ({ children, history, ...props }) => {
  const { data, accept, redirectTo, onSuccess, onFailure, host } = props;

  const [
    { copiedData },
    dispatchClipboardActions,
    { getClipboardData, clearClipboardData, ...clipboardActions }
  ] = useClipboardReducer();

  const _onSuccess = response => {
    if (redirectTo) history.push(redirectTo());
    if (onSuccess) onSuccess(response);
    clearClipboardData();
    dispatchClipboardActions(clipboardActions.updateState({
      copiedData: null
    }));
  };

  React.useEffect(() => {
    if (getClipboardData()) {
      dispatchClipboardActions(clipboardActions.updateState({
        copiedData: getClipboardData()
      }));
    }

    return () => {
      dispatchClipboardActions(clipboardActions.updateState({
        destination: undefined,
        accept: undefined,
        onSuccess: undefined,
        onFailure: undefined,
      }));
    };
  }, []);

  React.useEffect(() => {
    dispatchClipboardActions(clipboardActions.updateState({
      destination: { ...data, host },
      accept,
      onSuccess: _onSuccess,
      onFailure: error => onFailure && onFailure(error),
    }));
  }, [onSuccess, onFailure, data, accept, redirectTo]);

  return (
    <>
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
    </>
  );
};

ClipboardPasteBox.propTypes = {
  data: PropTypes.object.isRequired,
  accept: PropTypes.array.isRequired,
  redirectTo: PropTypes.func,
  children: PropTypes.node
};

export default withRouter(reduxComponent(ClipboardPasteBox, state => ({
  host: state.$APP.host
})));
