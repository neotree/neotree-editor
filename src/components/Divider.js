/* global document */
import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import makeStyles from '@material-ui/core/styles/makeStyles';
import MuiDivider from '@material-ui/core/Divider';

const useStyles = makeStyles(theme => ({
  backgroundColor: ({ color: c }) => {
    const backgroundColor = theme.palette[c] ? theme.palette[c].main : null;
    return backgroundColor ? { backgroundColor } : {};
  },
}));

const Divider = React.forwardRef(({ className, color, ...props }, ref) => {
  const classes = useStyles({ color });

  return (
    <>
      <MuiDivider
        {...props}
        ref={ref}
        className={cx(className, classes.backgroundColor)}
      />
    </>
  );
});

Divider.propTypes = {
  className: PropTypes.string,
};

export default Divider;
