/* global alert, fetch, window */
import React from 'react';
import PropTypes from 'prop-types';
import useConfirmModal from '@/utils/useConfirmModal';
import OverlayLoader from '@/components/OverlayLoader';

const DeleteDiagnoses = React.forwardRef(({
  children,
  diagnoses,
  onClick,
  ...props
}, ref) => {
  const deleteMultiple = diagnoses.length > 1;
  const [renderConfirmModal, confirm] = useConfirmModal();
  const [deletingDiagnoses, setDeletingDiagnoses] = React.useState(false);

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
        title: `Delete diagnosis${deleteMultiple ? 's' : ''}`,
        message: `Are you sure you want to delete diagnosis${deleteMultiple ? 's' : ''}?`,
        onConfirm: () => {
          (async () => {
            setDeletingDiagnoses(true);
            try {
              const res = await fetch('/delete-diagnoses', {
                headers: { 'Content-Type': 'application/json' },
                method: 'POST',
                body: JSON.stringify({ diagnoses }),
              });
              const { errors } = await res.json();
              if (errors && errors.length) {
                alert(JSON.stringify(errors));
              } else {
                window.location.reload();
              }
            } catch (e) { alert(e.message); }
            setDeletingDiagnoses(false);
          })();
        },
      })}

      {deletingDiagnoses ? <OverlayLoader /> : null}
    </>
  );
});

DeleteDiagnoses.propTypes = {
  onClick: PropTypes.func,
  children: PropTypes.node,
  diagnoses: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
  })).isRequired,
};

export default DeleteDiagnoses;
