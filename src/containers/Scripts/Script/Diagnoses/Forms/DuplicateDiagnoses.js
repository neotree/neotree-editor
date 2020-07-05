import React from 'react';
import PropTypes from 'prop-types';
import useConfirmModal from '@/utils/useConfirmModal';
import { useDiagnosesContext } from '@/contexts/diagnoses';

const DuplicateDiagnoses = React.forwardRef(({
  children,
  ids,
  onClick,
  ...props
}, ref) => {
  const duplicateMultiple = ids.length > 1;
  const { duplicateDiagnoses } = useDiagnosesContext();
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
        title: `Duplicate diagnosis${duplicateMultiple ? 's' : ''}`,
        message: `Are you sure you want to duplicate diagnosis${duplicateMultiple ? 's' : ''}?`,
        onConfirm: () => duplicateDiagnoses(ids),
      })}
    </>
  );
});

DuplicateDiagnoses.propTypes = {
  onClick: PropTypes.func,
  children: PropTypes.node,
  ids: PropTypes.array.isRequired,
};

export default DuplicateDiagnoses;
