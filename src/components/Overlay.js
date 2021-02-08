/* global document */
import React from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import makeStyles from '@material-ui/core/styles/makeStyles';
import cx from 'classnames';

const useStyles = makeStyles(() => ({
  root: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 999999,
  },
}));

const Overlay = ({ className, ...props }) => {
  const classes = useStyles();

  return (
    <>
      {createPortal(
        <div
          {...props}
          className={cx(classes.root, className)}
        />,
        document.body
      )}
    </>
  );
};

Overlay.propTypes = {
  className: PropTypes.string,
};

export default Overlay;
