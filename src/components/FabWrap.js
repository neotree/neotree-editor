/* global document */
import React from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import cx from 'classnames';
import makeStyles from '@material-ui/core/styles/makeStyles';

const useStyles = makeStyles(() => ({
  root: {
    position: 'fixed',
    bottom: 20,
    right: 20,
    zIndex: 10,
  }
}));

const FabWrap = React.forwardRef(({ className, ...props }, ref) => {
  const classes = useStyles();

  return (
    <>
      {createPortal(
        <div
          {...props}
          ref={ref}
          className={cx(className, classes.root)}
        />,
        document.body
      )}
    </>
  );
});

FabWrap.propTypes = {
  className: PropTypes.string,
};

export default FabWrap;
