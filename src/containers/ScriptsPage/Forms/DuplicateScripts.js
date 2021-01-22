/* global alert, fetch, window */
import React from 'react';
import PropTypes from 'prop-types';
import OverlayLoader from '@/components/OverlayLoader';

const DuplicateScripts = React.forwardRef(({
  children,
  onClick,
  scripts,
  ...props
}, ref) => {
  const [duplicatingScripts, setDuplicatingScripts] = React.useState(false);
  const [duplicateScriptsError, setDuplicateScriptsError] = React.useState(null);

  return (
    <>
      <div
        {...props}
        ref={ref}
        onClick={e => {
          (async () => {
            setDuplicatingScripts(true);
            try {
              await fetch('/duplicate-scripts', {
                headers: { 'Content-Type': 'application/json' },
                method: 'POST',
                body: JSON.stringify({ scripts }),
              });
              window.location.reload();
            } catch (e) { setDuplicateScriptsError(e); }
            setDuplicatingScripts(false);
          })();
          if (onClick) onClick(e);
        }}
      >
        {children}
      </div>

      {duplicatingScripts && <OverlayLoader />}
    </>
  );
});

DuplicateScripts.propTypes = {
  onClick: PropTypes.func,
  children: PropTypes.node,
  scripts: PropTypes.arrayOf(PropTypes.shape({ scriptId: PropTypes.string, })).isRequired,
};

export default DuplicateScripts;
