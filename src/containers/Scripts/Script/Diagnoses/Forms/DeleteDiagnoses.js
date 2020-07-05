import React from 'react';
import PropTypes from 'prop-types';
import useConfirmModal from '@/utils/useConfirmModal';
import { useDiagnosesContext } from '@/contexts/diagnoses';

const DeleteDiagnoses = React.forwardRef(({
  children,
  ids,
  onClick,
  ...props
}, ref) => {
  const deleteMultiple = ids.length > 1;
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
        onConfirm: () => deleteDiagnoses(ids),
      })}
    </>
  );
});

DeleteDiagnoses.propTypes = {
  onClick: PropTypes.func,
  children: PropTypes.node,
  ids: PropTypes.array.isRequired,
};

export default DeleteDiagnoses;
