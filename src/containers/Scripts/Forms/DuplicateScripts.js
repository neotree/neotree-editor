/* global alert */
import React from 'react';
import PropTypes from 'prop-types';
import OverlayLoader from '@/components/OverlayLoader';
import * as api from '@/api/scripts';
import getErrorMessage from '@/utils/getErrorMessage';
import { useScriptsContext } from '@/contexts/scripts';

const DuplicateScripts = React.forwardRef(({
  children,
  onClick,
  ids,
  ...props
}, ref) => {
  const { setState: setScriptsState } = useScriptsContext();
  const [loading, setLoading] = React.useState(false);

  return (
    <>
      <div
        {...props}
        ref={ref}
        onClick={e => {
          setLoading(true);
          api.duplicateScript({ id: ids[0] })
            .then(({ script }) => {
              setLoading(false);
              setScriptsState(({ scripts }) => ({
                scripts: scripts.reduce((acc, s) => {
                  return [
                    ...acc,
                    s,
                    ...ids.includes(s.id) ? [script] : [],
                  ];
                }, []),
              }));
            })
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
  ids: PropTypes.array.isRequired,
};

export default DuplicateScripts;
