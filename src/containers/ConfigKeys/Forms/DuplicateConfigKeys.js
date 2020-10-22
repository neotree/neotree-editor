import React from 'react';
import PropTypes from 'prop-types';
import useConfirmModal from '@/utils/useConfirmModal';
import { useConfigKeysContext } from '@/contexts/config-keys';

const DuplicateConfigKeys = React.forwardRef(({
  children,
  configKeys,
  onClick,
  ...props
}, ref) => {
  const duplicateMultiple = configKeys.length > 1;
  const { duplicateConfigKeys } = useConfigKeysContext();
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
        title: `Duplicate config key${duplicateMultiple ? 's' : ''}`,
        message: `Are you sure you want to duplicate config key${duplicateMultiple ? 's' : ''}?`,
        onConfirm: () => duplicateConfigKeys(configKeys),
      })}
    </>
  );
});

DuplicateConfigKeys.propTypes = {
  onClick: PropTypes.func,
  children: PropTypes.node,
  configKeys: PropTypes.array.isRequired,
};

export default DuplicateConfigKeys;
