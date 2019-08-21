import React from 'react';
import PropTypes from 'prop-types';
import useClipboardReducer from 'AppHooks/clipboardReducer';
import reduxComponent from 'reduxComponent';
import { withRouter } from 'react-router';

const ClipboardPasteBox = ({ children, history, ...props }) => {
  const { data, accept, redirectTo, onSuccess, onFailure, host } = props;

  const [
    clipboardState, // eslint-disable-line
    dispatchClipboardActions,
    clipboardActions
  ] = useClipboardReducer();

  React.useEffect(() => {
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
      onSuccess: response => {
        if (redirectTo) history.push(redirectTo());
        if (onSuccess) onSuccess(response);
      },
      onFailure: error => onFailure && onFailure(error),
    }));
  }, [onSuccess, onFailure, data, accept, redirectTo]);

  return children;
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
