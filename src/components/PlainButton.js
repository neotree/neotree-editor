import React from 'react';
import PropTypes from 'prop-types';
import makeStyles from '@material-ui/core/styles/makeStyles';
import cx from 'classnames';

const useStyles = makeStyles((theme) => ({
  root: {
    background: 'transparent',
    border: 'none',
    outline: 'none',
    padding: 0,
    fontSize: 'inherit',
    cursor: 'pointer',

    '&[disabled]': {
      cursor: 'not-allowed',
      color: theme.palette.action.disabled,
    },
  },
  color: ({ color, disabled }) => {
    if (typeof color === 'string') {
      color = theme.palette[color] ? (theme.palette[color].main || 'inherit') : 'inherit';
    }

    if (color && color.map) {
      const [key, value] = color;
      color = theme.palette[key] ? (theme.palette[key][value] || 'inherit') : 'inherit';
    }

    if (disabled) color = theme.palette.action.disabled;

    return { color };
  },
}));
const PlainButton = React.forwardRef(({ className, disabled, color, ...props }, ref) => {
  const classes = useStyles({ color, disabled });

  return (
    <>
      <button
        className={cx(className, classes.root, { [classes.color]: color })}
        ref={ref}
        type="button"
        {...props}
      />
    </>
  );
});

PlainButton.propTypes = {
  className: PropTypes.string,
  disabled: PropTypes.bool,
  color: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.array,
  ]),
};

export default PlainButton;
