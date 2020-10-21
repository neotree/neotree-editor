import React from 'react';
import PropTypes from 'prop-types';
import useConfirmModal from '@/utils/useConfirmModal';
import { useScriptsContext } from '@/contexts/scripts';

const DeleteScripts = React.forwardRef(({
  children,
  scripts,
  onClick,
  ...props
}, ref) => {
  const deleteMultiple = scripts.length > 1;
  const [renderConfirmModal, confirm] = useConfirmModal();
  const { deleteScripts } = useScriptsContext();

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
        onConfirm: () => deleteScripts(scripts),
      })}
    </>
  );
});

DeleteScripts.propTypes = {
  onClick: PropTypes.func,
  children: PropTypes.node,
  scripts: PropTypes.array.isRequired,
};

export default DeleteScripts;
