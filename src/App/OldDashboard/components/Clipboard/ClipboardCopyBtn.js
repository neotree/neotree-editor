import React from 'react';
import PropTypes from 'prop-types';
import useClipboardReducer from 'AppHooks/clipboardReducer';
import reduxComponent from 'reduxComponent';

const ClipboardCopyBtn = ({
  container,
  data,
  children,
  host,
  actions, // eslint-disable-line
  ...props
}) => {
  const [
    clipboardState, // eslint-disable-line
    dispatchClipboardActions, // eslint-disable-line
    { copyToClipboard }
  ] = useClipboardReducer();
  const Container = container || React.Fragment;

  return (
    <Container>
      <div
        {...props}
        onClick={e => {
          copyToClipboard({ ...data, host });
          if (props.onClick) props.onClick(e);
        }}
      >{children}</div>
    </Container>
  );
};

ClipboardCopyBtn.propTypes = {
  children: PropTypes.node,
  data: PropTypes.object.isRequired,
  onClick: PropTypes.func
};

export default reduxComponent(ClipboardCopyBtn, state => ({
  host: state.$APP.host
}));