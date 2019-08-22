import React from 'react';
import PropTypes from 'prop-types';
import useClipboardReducer from 'AppHooks/clipboardReducer';
import reduxComponent from 'reduxComponent';

const ClipboardPasteBtn = ({
  container,
  children,
  onSuccess,
  onFailure,
  ...props
}) => {
  const [
    clipboardState, // eslint-disable-line
    dispatchClipboardActions, // eslint-disable-line
    { pasteClipboardData }
  ] = useClipboardReducer();
  const Container = container || React.Fragment;

  return (
    <Container>
      <div
        {...props}
        onClick={e => {
          pasteClipboardData(clipboardState.destination)
          .then(onSuccess)
          .catch(onFailure);
          if (props.onClick) props.onClick(e);
        }}
      >{children}</div>
    </Container>
  );
};

ClipboardPasteBtn.propTypes = {
  children: PropTypes.node,
  onClick: PropTypes.func
};

export default reduxComponent(ClipboardPasteBtn, state => ({
  host: state.$APP.host
}));
