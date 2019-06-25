import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

const RadioGroup = ({
  children,
  className,
  name,
  onChange,
  value,
  disabled,
  ...props
}) => {
  return (
    <div
      {...props}
      className={cx(className, 'ui__radioGroup')}
    >
      {React.Children.map(children, child => child &&
        React.cloneElement(child, {
          checked: value === child.props.value,
          onChange,
          name,
          disabled
        }))}
    </div>
  );
};

RadioGroup.propTypes = {
  children: PropTypes.node,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string
};

export default RadioGroup;
