/* global alert, fetch, window */
import React from 'react';
import PropTypes from 'prop-types';
import useConfirmModal from '@/utils/useConfirmModal';
import OverlayLoader from '@/components/OverlayLoader';

const DeleteScreens = React.forwardRef(({
  children,
  screens,
  onClick,
  ...props
}, ref) => {
  const deleteMultiple = screens.length > 1;
  const [renderConfirmModal, confirm] = useConfirmModal();
  const [deletingScreens, setDeletingScreens] = React.useState(false);

  return (
    <>
      <div
        {...props}
        ref={ref}
        onClick={e => {
          confirm();
          if (onClick) onClick(e);
        }}
      >
        {children}
      </div>

      {renderConfirmModal({
        title: `Delete screen${deleteMultiple ? 's' : ''}`,
        message: `Are you sure you want to delete screen${deleteMultiple ? 's' : ''}?`,
        onConfirm: () => {
          (async () => {
            setDeletingScreens(true);
            try {
              const res = await fetch('/delete-screens', {
                headers: { 'Content-Type': 'application/json' },
                method: 'POST',
                body: JSON.stringify({ screens }),
              });
              const { errors } = await res.json();
              if (errors && errors.length) {
                alert(JSON.stringify(errors));
              } else {
                window.location.reload();
              }
            } catch (e) { alert(e.message); }
            setDeletingScreens(false);
          })();
        },
      })}

      {deletingScreens ? <OverlayLoader /> : null}
    </>
  );
});

DeleteScreens.propTypes = {
  onClick: PropTypes.func,
  children: PropTypes.node,
  screens: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
  })).isRequired,
};

export default DeleteScreens;
