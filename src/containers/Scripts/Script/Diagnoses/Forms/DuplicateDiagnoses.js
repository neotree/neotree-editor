/* global alert */
import React from 'react';
import PropTypes from 'prop-types';
import OverlayLoader from '@/components/OverlayLoader';
import * as api from '@/api/diagnoses';
import getErrorMessage from '@/utils/getErrorMessage';
import { useDiagnosesContext } from '@/contexts/diagnoses';

const DuplicateDiagnoses = React.forwardRef(({
  children,
  onClick,
  ids,
  ...props
}, ref) => {
  const { setState: setDiagnosesState } = useDiagnosesContext();
  const [loading, setLoading] = React.useState(false);

  return (
    <>
      <div
        {...props}
        ref={ref}
        onClick={e => {
          setLoading(true);
          api.duplicateScreen({ id: ids[0] })
            .catch(e => {
              setLoading(false);
              alert(getErrorMessage(e));
            })
            .then(({ diagnosis }) => {
              setLoading(false);
              setDiagnosesState(({ diagnoses }) => ({
                diagnoses: diagnoses.reduce((acc, s) => {
                  return [
                    ...acc,
                    s,
                    ...ids.includes(s.id) ? [diagnosis] : [],
                  ];
                }, []),
              }));
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
  ids: PropTypes.array.isRequired,
};

export default DuplicateDiagnoses;
