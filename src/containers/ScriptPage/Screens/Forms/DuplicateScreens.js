/* global alert */
import React from 'react';
import PropTypes from 'prop-types';
import OverlayLoader from '@/components/OverlayLoader';
import getErrorMessage from '@/utils/getErrorMessage';
import { useScreensContext } from '@/contexts/screens';

const DuplicateScreens = React.forwardRef(({
  children,
  onClick,
  screens,
  ...props
}, ref) => {
  const { duplicateScreens, } = useScreensContext();
  const [loading, setLoading] = React.useState(false);

  return (
    <>
      <div
        {...props}
        ref={ref}
        onClick={e => {
          setLoading(true);
          duplicateScreens(screens)
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

DuplicateScreens.propTypes = {
  onClick: PropTypes.func,
  children: PropTypes.node,
  screens: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
  })).isRequired,
};

export default DuplicateScreens;
