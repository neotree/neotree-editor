/* global alert, fetch, window */
import React from 'react';
import PropTypes from 'prop-types';
import OverlayLoader from '@/components/OverlayLoader';
import useConfirmModal from '@/utils/useConfirmModal';

const DuplicateConfigKeys = React.forwardRef(({
  children,
  configKeys,
  onClick,
  ...props
}, ref) => {
  const [duplicatingConfigKeys, setDuplicatingConfigKeys] = React.useState(false);
  const [renderConfirmModal, confirm] = useConfirmModal();

  const duplicateMultiple = configKeys.length > 1;

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
        title: `Duplicate config key${duplicateMultiple ? 's' : ''}`,
        message: `Are you sure you want to duplicate config key${duplicateMultiple ? 's' : ''}?`,
        onConfirm: () => {
          (async () => {
            setDuplicatingConfigKeys(true);
            try {
              const res = await fetch('/duplicate-config-keys', {
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
            setDuplicatingConfigKeys(false);
          })();
        },
      })}

      {duplicatingConfigKeys && <OverlayLoader />}
    </>
  );
});

DuplicateConfigKeys.propTypes = {
  onClick: PropTypes.func,
  children: PropTypes.node,
  configKeys: PropTypes.array.isRequired,
};

export default DuplicateConfigKeys;
