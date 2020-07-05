import React from 'react';
import PropTypes from 'prop-types';
import useConfirmModal from '@/utils/useConfirmModal';
import { useScriptsContext } from '@/contexts/scripts';

const DuplicateScripts = React.forwardRef(({
  children,
  ids,
  onClick,
  ...props
}, ref) => {
  const duplicateMultiple = ids.length > 1;
  const { duplicateScripts } = useScriptsContext();
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
        title: `Duplicate script${duplicateMultiple ? 's' : ''}`,
        message: `Are you sure you want to duplicate script${duplicateMultiple ? 's' : ''}?`,
        onConfirm: () => duplicateScripts(ids),
      })}
    </>
  );
});

DuplicateScripts.propTypes = {
  onClick: PropTypes.func,
  children: PropTypes.node,
  ids: PropTypes.array.isRequired,
};

export default DuplicateScripts;
