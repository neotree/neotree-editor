/* global alert, fetch, window */
import React from 'react';
import PropTypes from 'prop-types';
import useConfirmModal from '@/utils/useConfirmModal';
import OverlayLoader from '@/components/OverlayLoader';

const DeleteScripts = React.forwardRef(({
  children,
  scripts,
  onClick,
  ...props
}, ref) => {
  const deleteMultiple = scripts.length > 1;
  const [renderConfirmModal, confirm] = useConfirmModal();
  const [deletingScripts, setDeletingScripts] = React.useState(false);

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
        title: `Delete script${deleteMultiple ? 's' : ''}`,
        message: `Are you sure you want to delete script${deleteMultiple ? 's' : ''}?`,
        onConfirm: () => {
          (async () => {
            setDeletingScripts(true);
            try {
              const res = await fetch('/delete-scripts', {
                headers: { 'Content-Type': 'application/json' },
                method: 'POST',
                body: JSON.stringify({ scripts }),
              });
              const { errors } = await res.json();
              if (errors && errors.length) {
                alert(JSON.stringify(errors));
              } else {
                window.location.reload();
              }
            } catch (e) { alert(e.message); }
            setDeletingScripts(false);
          })();
        },
      })}

      {deletingScripts ? <OverlayLoader /> : null}
    </>
  );
});

DeleteScripts.propTypes = {
  onClick: PropTypes.func,
  children: PropTypes.node,
  scripts: PropTypes.array.isRequired,
};

export default DeleteScripts;
