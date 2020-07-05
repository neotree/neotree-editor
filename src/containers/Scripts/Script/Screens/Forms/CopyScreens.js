import React from 'react';
import PropTypes from 'prop-types';
import useConfirmModal from '@/utils/useConfirmModal';
import { useScreensContext } from '@/contexts/screens';

const CopyScreens = React.forwardRef(({
  children,
  ids,
  onClick,
  ...props
}, ref) => {
  const copyMultiple = ids.length > 1;
  const { copyScreens } = useScreensContext();
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
        title: `Copy screen${copyMultiple ? 's' : ''}`,
        message: `Are you sure you want to copy screen${copyMultiple ? 's' : ''}?`,
        onConfirm: () => copyScreens(ids),
      })}
    </>
  );
});

CopyScreens.propTypes = {
  onClick: PropTypes.func,
  children: PropTypes.node,
  ids: PropTypes.array.isRequired,
};

export default CopyScreens;
