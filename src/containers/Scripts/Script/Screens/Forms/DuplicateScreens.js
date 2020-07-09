/* global alert */
import React from 'react';
import PropTypes from 'prop-types';
import OverlayLoader from '@/components/OverlayLoader';
import * as api from '@/api/screens';
import getErrorMessage from '@/utils/getErrorMessage';
import { useScreensContext } from '@/contexts/screens';

const DuplicateScreens = React.forwardRef(({
  children,
  onClick,
  ids,
  ...props
}, ref) => {
  const { setState: setScreensState } = useScreensContext();
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
            .then(({ screen }) => {
              setLoading(false);
              setScreensState(({ screens }) => ({
                screens: screens.reduce((acc, s) => {
                  return [
                    ...acc,
                    s,
                    ...ids.includes(s.id) ? [screen] : [],
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

DuplicateScreens.propTypes = {
  onClick: PropTypes.func,
  children: PropTypes.node,
  ids: PropTypes.array.isRequired,
};

export default DuplicateScreens;
