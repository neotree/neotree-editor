import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import './index.scss';

export { default as RadioGroup } from './RadioGroup';

export class RadioButton extends React.Component {
  state = {
    checked: this.props.checked || false
  };

  componentWillUpdate(nextProps) {
    if (nextProps.checked !== this.props.checked) {
      this.setState({ checked: nextProps.checked });
    }
  }

  render() {
    const { className, label, ...props } = this.props;
    const { checked } = this.state;

    return (
      <div
        className={cx(className, 'ui__radioBtn ui__smTextSize', {
          disabled: props.disabled
        })}
      >
        <div
          className={cx('ui__radioBtnInput', {
            uiBorder__lightGreyColor: !checked || props.disabled,
            uiBg__lightGreyColor: props.disabled,
            'uiBorder__primaryColor uiBg__primaryColor': !props.disabled && checked
          })}
        >
          {checked &&
            <span className={cx('ui__radioBtnIcon ui__color_on_primary')}>
              <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24">
                <path fill="none" d="M24 24H0V0h24v24z" />
                <circle fill="#010101" cx="12" cy="12" r="8" />
              </svg>
            </span>}

          <input
            {...props}
            type="radio"
            onChange={e => {
              this.setState({ checked: e.target.checked });
              if (props.onChange) props.onChange(e);
            }}
          />
        </div>

        {label ?
          <div
            className={cx('ui__radioBtnLabel', {
              ui__copyColor: !props.disabled,
              ui__greyColor: props.disabled
            })}
          >
            <span>{label}</span>
          </div> : null}
      </div>
    );
  }
}

RadioButton.propTypes = {
  className: PropTypes.string,
  label: PropTypes.string,
  name: PropTypes.string
};

export default RadioButton;
