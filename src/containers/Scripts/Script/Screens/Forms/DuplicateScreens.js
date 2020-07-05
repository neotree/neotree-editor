import React from 'react';
import PropTypes from 'prop-types';
import useConfirmModal from '@/utils/useConfirmModal';
import { useScreensContext } from '@/contexts/screens';

const DuplicateScreens = React.forwardRef(({
  children,
  ids,
  onClick,
  ...props
}, ref) => {
  const duplicateMultiple = ids.length > 1;
  const { duplicateScreens } = useScreensContext();
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
        title: `Duplicate screen${duplicateMultiple ? 's' : ''}`,
        message: `Are you sure you want to duplicate screen${duplicateMultiple ? 's' : ''}?`,
        onConfirm: () => duplicateScreens(ids),
      })}
    </>
  );
});

DuplicateScreens.propTypes = {
  onClick: PropTypes.func,
  children: PropTypes.node,
  ids: PropTypes.array.isRequired,
};

export default DuplicateScreens;
