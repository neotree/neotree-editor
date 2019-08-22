import React from 'react';
import PropTypes from 'prop-types';
import useClipboardReducer from 'AppHooks/clipboardReducer';
import reduxComponent from 'reduxComponent';
import { withRouter } from 'react-router';

const ClipboardPasteBox = ({ children, ...props }) => {
  const { data, accept, onSuccess, onFailure, host } = props;

  const [
    clipboardState, // eslint-disable-line
    dispatchClipboardActions,
    { getClipboardData, clearClipboardData, ...clipboardActions }
  ] = useClipboardReducer();

  const _onSuccess = response => {
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
  }, [onSuccess, onFailure, data, accept]);

  return children;
};

ClipboardPasteBox.propTypes = {
  data: PropTypes.object.isRequired,
  accept: PropTypes.array.isRequired,
  children: PropTypes.node
};

export default withRouter(reduxComponent(ClipboardPasteBox, state => ({
  host: state.$APP.host
})));
