import React from 'react';
import PropTypes from 'prop-types';
import useConfirmModal from '@/utils/useConfirmModal';
import { useDiagnosesContext } from '@/contexts/diagnoses';

const DeleteDiagnoses = React.forwardRef(({
  children,
  diagnoses,
  onClick,
  ...props
}, ref) => {
  const deleteMultiple = diagnoses.length > 1;
  const [renderConfirmModal, confirm] = useConfirmModal();
  const { deleteDiagnoses } = useDiagnosesContext();

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
        title: `Delete diagnosis${deleteMultiple ? 's' : ''}`,
        message: `Are you sure you want to delete diagnosis${deleteMultiple ? 's' : ''}?`,
        onConfirm: () => deleteDiagnoses(diagnoses),
      })}
    </>
  );
});

DeleteDiagnoses.propTypes = {
  onClick: PropTypes.func,
  children: PropTypes.node,
  diagnoses: PropTypes.arrayOf(PropTypes.shape({
    diagnosisId: PropTypes.string.isRequired,
    scriptId: PropTypes.string.isRequired,
  })).isRequired,
};

export default DeleteDiagnoses;
