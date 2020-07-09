import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@/components/Layout';
import cx from 'classnames';

const useStyles = makeStyles(() => ({
  root: ({ size }) => ({
    width: size || 60,
    height: 'auto',
    borderRadius: '50%',
  })
}));

const Logo = ({ color, className, size, ...props }) => {
  const classes = useStyles({ size });

  return (
    <>
      <img
        {...props}
        className={cx(classes.root, className)}
        role="presentation"
        src={color === 'light' ? require('~/assets/images/neotree-icon-light.png') : require('~/assets/images/neotree-icon-dark.png')}
      />
    </>
  );
};

Logo.defaultProps = {
  color: 'dark',
};

Logo.propTypes = {
  size: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  className: PropTypes.string,
  color: PropTypes.oneOf(['dark', 'light']).isRequired
};

export default Logo;
