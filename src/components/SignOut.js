/* global window, alert */
import React from 'react';
import PropTypes from 'prop-types';
import { useAppContext } from '@/contexts/app';
import useConfirmModal from '@/utils/useConfirmModal';
import copy from '@/constants/copy';
import * as api from '@/api/auth';
import OverlayLoader from '@/components/OverlayLoader';
import getErrorMsg from '@/utils/getErrorMessage';

const SignOut = ({ Component, ...props }) => {
  Component = Component || 'span';
  const { state: { authenticatedUser } } = useAppContext();

  const [renderConfirmModal, confirm] = useConfirmModal();
  const [signingOut, setSigningOut] = React.useState(false);

  if (!authenticatedUser) return null;

  return (
    <>
      <Component
        {...props}
        onClick={e => {
          e.preventDefault();
          confirm();
          if (props.onClick) props.onClick(e);
        }}
      >Sign out</Component>

      {signingOut && <OverlayLoader />}

      {renderConfirmModal({
        title: copy.CONFIRM_MODAL_TITLE,
        message: copy.CONFIRM_SIGN_OUT_MESSAGE,
        onConfirm: () => {
          setSigningOut(true);
          api.signOut()
            .catch(e => {
              setSigningOut(false);
              alert(getErrorMsg(e));
            })
            .then(() => window.location.reload())
        },
      })}
    </>
  );
};

SignOut.propTypes = {
  onClick: PropTypes.func,
  Component: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.func,
    PropTypes.shape({
      render: PropTypes.func
    })
  ])
};

export default SignOut;
