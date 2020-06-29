import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@/components/Layout';
import cx from 'classnames';

const useStyles = makeStyles(() => ({
  root: {
    width: 60,
    height: 'auto',
  }
}));

const Logo = ({ color, className, ...props }) => {
  const classes = useStyles();

  return (
    <>
      <img
        {...props}
        className={cx(classes.root, className)}
        role="presentation"
        src={color === 'light' ? require('~/assets/neotree-icon-light.png') : require('~/assets/neotree-icon-dark.png')}
      />
    </>
  );
};

Logo.defaultProps = {
  color: 'dark',
};

Logo.propTypes = {
  className: PropTypes.string,
  color: PropTypes.oneOf(['dark', 'light']).isRequired
};

export default Logo;
