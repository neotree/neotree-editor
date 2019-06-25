import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

export class Label extends React.Component {
  state = { visible: false };

  componentDidMount() {
    this.timeOut = setTimeout(() => this.setState({ visible: true }), 25);
  }

  componentWillUnmount() {
    if (this.timeOut) clearTimeout(this.timeOut);
  }

  render() {
    const { label, placeholder, className } = this.props;
    const { visible } = this.state;

    return (
      <div
        className={cx(className, 'ui__inputLabel', {
          ui__xsTextSize: true,
          visible
        })}
      ><span>{label || placeholder}</span></div>
    );
  }
}

Label.propTypes = {
  label: PropTypes.string,
  placeholder: PropTypes.string
};

export default Label;
