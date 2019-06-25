import React from 'react';
import cx from 'classnames';

export default (children, type) => {
  let Component = null;
  React.Children.forEach(children, _child => {
    if (_child && (`${_child.type}` === `${type}`)) {
      Component = props => React.cloneElement(_child, {
        ...props,
        className: cx(_child.props.className, props.className)
      });
    }
  });
  return Component;
};
