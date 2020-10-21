/* global alert */
import React from 'react';
import PropTypes from 'prop-types';
import OverlayLoader from '@/components/OverlayLoader';
import getErrorMessage from '@/utils/getErrorMessage';
import { useDiagnosesContext } from '@/contexts/diagnoses';

const DuplicateDiagnoses = React.forwardRef(({
  children,
  onClick,
  diagnoses,
  ...props
}, ref) => {
  const { duplicateDiagnoses, } = useDiagnosesContext();
  const [loading, setLoading] = React.useState(false);

  return (
    <>
      <div
        {...props}
        ref={ref}
        onClick={e => {
          setLoading(true);
          duplicateDiagnoses(diagnoses)
            .then(() => setLoading(false))
            .catch(e => {
              setLoading(false);
              alert(getErrorMessage(e));
            });
          if (onClick) onClick(e);
        }}
      >
        {children}
      </div>

      {loading && <OverlayLoader />}
    </>
  );
});

DuplicateDiagnoses.propTypes = {
  onClick: PropTypes.func,
  children: PropTypes.node,
  diagnoses: PropTypes.arrayOf(PropTypes.shape({
    diagnosisId: PropTypes.string.isRequired,
    scriptId: PropTypes.string.isRequired,
  })).isRequired,
};

export default DuplicateDiagnoses;
