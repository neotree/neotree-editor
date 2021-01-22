/* global alert, fetch, window */
import React from 'react';
import PropTypes from 'prop-types';
import useConfirmModal from '@/utils/useConfirmModal';
import OverlayLoader from '@/components/OverlayLoader';

const DeleteConfigKeys = React.forwardRef(({
  children,
  configKeys,
  onClick,
  ...props
}, ref) => {
  const [deletingConfigKeys, setDeletingConfigKeys] = React.useState(false);
  
  const deleteMultiple = configKeys.length > 1;
  const [renderConfirmModal, confirm] = useConfirmModal();

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
        title: `Delete config key${deleteMultiple ? 's' : ''}`,
        message: `Are you sure you want to delete config key${deleteMultiple ? 's' : ''}?`,
        onConfirm: () => {
          (async () => {
            setDeletingConfigKeys(true);
            try {
              const res = await fetch('/delete-config-keys', {
                headers: { 'Content-Type': 'application/json' },
                method: 'POST',
                body: JSON.stringify({ configKeys }),
              });
              const { errors } = await res.json();
              if (errors && errors.length) {
                alert(JSON.stringify(errors));
              } else {
                window.location.reload();
              }
            } catch (e) { alert(e.message); }
            setDeletingConfigKeys(false);
          })();
        },
      })}

      {deletingConfigKeys ? <OverlayLoader /> : null}
    </>
  );
});

DeleteConfigKeys.propTypes = {
  onClick: PropTypes.func,
  children: PropTypes.node,
  configKeys: PropTypes.array.isRequired,
};

export default DeleteConfigKeys;
