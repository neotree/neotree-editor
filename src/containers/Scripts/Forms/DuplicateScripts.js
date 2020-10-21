/* global alert */
import React from 'react';
import PropTypes from 'prop-types';
import OverlayLoader from '@/components/OverlayLoader';
import getErrorMessage from '@/utils/getErrorMessage';
import { useScriptsContext } from '@/contexts/scripts';

const DuplicateScripts = React.forwardRef(({
  children,
  onClick,
  scripts,
  ...props
}, ref) => {
  const { duplicateScripts, } = useScriptsContext();
  const [loading, setLoading] = React.useState(false);

  return (
    <>
      <div
        {...props}
        ref={ref}
        onClick={e => {
          setLoading(true);
          duplicateScripts(scripts)
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

DuplicateScripts.propTypes = {
  onClick: PropTypes.func,
  children: PropTypes.node,
  scripts: PropTypes.arrayOf(PropTypes.shape({ scriptId: PropTypes.string, })).isRequired,
};

export default DuplicateScripts;
