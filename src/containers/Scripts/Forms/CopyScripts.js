import React from 'react';
import PropTypes from 'prop-types';
import useConfirmModal from '@/utils/useConfirmModal';
import { useScriptsContext } from '@/contexts/scripts';

const CopyScripts = React.forwardRef(({
  children,
  ids,
  onClick,
  ...props
}, ref) => {
  const copyMultiple = ids.length > 1;
  const { copyScripts } = useScriptsContext();
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
        title: `Copy script${copyMultiple ? 's' : ''}`,
        message: `Are you sure you want to copy script${copyMultiple ? 's' : ''}?`,
        onConfirm: () => copyScripts(ids),
      })}
    </>
  );
});

CopyScripts.propTypes = {
  onClick: PropTypes.func,
  children: PropTypes.node,
  ids: PropTypes.array.isRequired,
};

export default CopyScripts;
