import React from 'react';
import PropTypes from 'prop-types';
import useConfirmModal from '@/utils/useConfirmModal';
import { useConfigKeysContext } from '@/contexts/config-keys';

const DeleteConfigKeys = React.forwardRef(({
  children,
  ids,
  onClick,
  ...props
}, ref) => {
  const deleteMultiple = ids.length > 1;
  const [renderConfirmModal, confirm] = useConfirmModal();
  const { deleteConfigKeys } = useConfigKeysContext();

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
        onConfirm: () => deleteConfigKeys(ids),
      })}
    </>
  );
});

DeleteConfigKeys.propTypes = {
  onClick: PropTypes.func,
  children: PropTypes.node,
  ids: PropTypes.array.isRequired,
};

export default DeleteConfigKeys;
