import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Context from './Context';

const Toggler = ({ innerRef, onClick, children, className, ...props }) => {
  return (
    <Context.Consumer>
      {container => (
        <div
          {...props}
          ref={innerRef}
          className={cx(className, 'ui__dropdownToggler')}
          onClick={e => { if (onClick) onClick(e); container.toggle(); }}
        >
          {children}
        </div>
      )}
    </Context.Consumer>
  );
};

Toggler.propTypes = {
  innerRef: PropTypes.func,
  onClick: PropTypes.func,
  children: PropTypes.node,
  className: PropTypes.string
};

export default Toggler;
