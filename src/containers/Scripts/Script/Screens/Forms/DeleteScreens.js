import React from 'react';
import PropTypes from 'prop-types';
import useConfirmModal from '@/utils/useConfirmModal';
import { useScreensContext } from '@/contexts/screens';

const DeleteScreens = React.forwardRef(({
  children,
  ids,
  onClick,
  ...props
}, ref) => {
  const deleteMultiple = ids.length > 1;
  const [renderConfirmModal, confirm] = useConfirmModal();
  const { deleteScreens } = useScreensContext();

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
        onConfirm: () => deleteScreens(ids),
      })}
    </>
  );
});

DeleteScreens.propTypes = {
  onClick: PropTypes.func,
  children: PropTypes.node,
  ids: PropTypes.array.isRequired,
};

export default DeleteScreens;
