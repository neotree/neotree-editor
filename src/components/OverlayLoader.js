import React from 'react';
import PropTypes from 'prop-types';
import makeStyles from '@material-ui/core/styles/makeStyles';
import cx from 'classnames';
import Overlay from '@/components/Overlay';
import CircularProgress from '@material-ui/core/CircularProgress';

const useStyles = makeStyles(() => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  bg: ({ transparent }) => ({
    backgroundColor: transparent ? 'transparent' : 'rgba(0,0,0,.2)'
  }),
}));

const OverlayLoader = ({ className, loaderProps, transparent, ...props }) => {
  const classes = useStyles({ transparent });

  return (
    <>
      <Overlay
        {...props}
        className={cx(classes.root, classes.bg, className)}
      >
        <CircularProgress color="primary" {...loaderProps} />
      </Overlay>
    </>
  );
};

OverlayLoader.propTypes = {
  className: PropTypes.string,
  loaderProps: PropTypes.object,
  transparent: PropTypes.bool,
};

export default OverlayLoader;
