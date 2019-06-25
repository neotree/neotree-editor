import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import './index.scss';

const HeaderSection = ({ className, children, alignRight, ...props }) => {
  return (
    <div
      {...props}
      className={cx(className, 'ui__layoutHeaderSection', { alignRight })}
    >
      {children}
    </div>
  );
};

HeaderSection.propTypes = {
  alignRight: PropTypes.bool,
  className: PropTypes.string,
  children: PropTypes.node
};

export default HeaderSection;
