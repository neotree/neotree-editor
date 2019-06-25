import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import './index.scss';

export class Button extends React.Component {
  render() {
    const { children, className, size, ...props } = this.props;

    return (
      <button
        {...props}
        className={cx(className, 'ui__button', `ui__button_${size || 'default'}`, {
          ui__regularFont: true,
          'uiBorder__primaryColor ui__copyColor': !props.disabled,
          'uiBorder__lightGreyColor uiBg__lightGreyColor ui__greyColor': props.disabled,
          disabled: props.disabled
        })}
      >
        {children}
      </button>
    );
  }
}

Button.propTypes = {
  children: PropTypes.node,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  size: PropTypes.oneOf(['default', 'sm', 'xs', 'lg'])
};

export default Button;
