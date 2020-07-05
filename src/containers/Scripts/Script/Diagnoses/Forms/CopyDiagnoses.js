import React from 'react';
import PropTypes from 'prop-types';
import useConfirmModal from '@/utils/useConfirmModal';
import { useDiagnosesContext } from '@/contexts/diagnoses';

const CopyDiagnoses = React.forwardRef(({
  children,
  ids,
  onClick,
  ...props
}, ref) => {
  const copyMultiple = ids.length > 1;
  const { copyDiagnoses } = useDiagnosesContext();
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
        title: `Copy diagnosis${copyMultiple ? 's' : ''}`,
        message: `Are you sure you want to copy diagnosis${copyMultiple ? 's' : ''}?`,
        onConfirm: () => copyDiagnoses(ids),
      })}
    </>
  );
});

CopyDiagnoses.propTypes = {
  onClick: PropTypes.func,
  children: PropTypes.node,
  ids: PropTypes.array.isRequired,
};

export default CopyDiagnoses;
