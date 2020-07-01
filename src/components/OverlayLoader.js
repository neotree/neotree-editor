import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@/components/Layout';
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
}));

const OverlayLoader = ({ className, loaderProps, ...props }) => {
  const classes = useStyles();

  return (
    <>
      <Overlay
        {...props}
        className={cx(classes.root, className)}
      >
        <CircularProgress color="primary" {...loaderProps} />
      </Overlay>
    </>
  );
};

OverlayLoader.propTypes = {
  className: PropTypes.string,
  loaderProps: PropTypes.object,
};

export default OverlayLoader;
