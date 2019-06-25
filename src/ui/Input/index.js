import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Label from './Label';
import './index.scss';

export class Input extends React.Component {
  state = {
    focused: false
  };

  onFocusChange = e => {
    const { onFocus, onBlur } = this.props;
    const focused = e.type === 'focus';
    this.setState({ focused });
    if (focused && onFocus) onFocus(e);
    if (!focused && onBlur) onBlur(e);
  };

  render() {
    const { className, placeholder, label, error, ...props } = this.props;
    const { focused } = this.state;

    const Input = props.rows ? 'textarea' : 'input';

    return (
      <div className="ui__inputWrap">
        <div
          className={cx(className, 'ui__input ui__regularFont ui__smTextSize', {
            focused,
            uiBorder__primaryColor: !(error || props.disabled) && (focused || props.value),
            'ui__lightGreyColor uiBorder__lightGreyColor': props.disabled,
            ui__copyColor: !props.disabled,
            'uiBorder__dangerColor ui__dangerColor': error,
            uiBorder__lightGreyColor: !error && (props.value ? false : !focused)
          })}
        >
          {(props.value || focused) && (label || placeholder) ?
            <Label
              label={label}
              placeholder={placeholder}
              className={cx({
                ui__dangerColor: error,
                ui__primaryColor: !(error || props.disabled)
              })}
            /> : null}

          <Input
            {...props}
            className={cx('ui__inputField', {
              ui__defaultTextSize: true
            })}
            onFocus={this.onFocusChange}
            onBlur={this.onFocusChange}
            placeholder={focused ? '' : placeholder}
          />
        </div>

        {error ?
          <div
            className={cx('ui__inputAlert ui__xsTextSize ui__dangerColor')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 18 18">
              <path d="M0 0h18v18H0z" fill="none" />
              <path d="M9 1.03c-4.42 0-8 3.58-8 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zM10 13H8v-2h2v2zm0-3H8V5h2v5z" />
            </svg>&nbsp;
            <span>{error}</span>
          </div> : null}
      </div>
    );
  }
}

Input.propTypes = {
  name: PropTypes.string,
  onFocs: PropTypes.bool,
  onBlur: PropTypes.bool,
  className: PropTypes.string,
  label: PropTypes.string,
  placeholder: PropTypes.string
};

export default Input;
