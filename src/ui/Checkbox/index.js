import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import './index.scss';

export class Checkbox extends React.Component {
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
        className={cx(className, 'ui__checkbox ui__smTextSize', {
          disabled: props.disabled
        })}
      >
        <div
          className={cx('ui__checkboxInput', {
            uiBorder__lightGreyColor: !checked || props.disabled,
            uiBg__lightGreyColor: props.disabled,
            'uiBorder__primaryColor uiBg__primaryColor': !props.disabled && checked
          })}
        >
          {checked &&
            <span className={cx('ui__checkboxIcon ui__color_on_primary')}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <path fill="none" d="M0 0h24v24H0z" />
                <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
              </svg>
            </span>}

          <input
            {...props}
            type="checkbox"
            onChange={e => this.setState({
              checked: e.target.checked
            }, () => props.onChange && props.onChange(e))}
          />
        </div>

        {label ?
          <div
            className={cx('ui__checkboxLabel', {
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

Checkbox.propTypes = {
  className: PropTypes.string,
  label: PropTypes.string,
  name: PropTypes.string
};

export default Checkbox;
