import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

export default class FormSection extends Component {
  render() {
    const { className, label, style, topSpace, ...otherProps } = this.props;
    const classes = classNames(className, 'mdl-form-section', {
      'mdl-form-section-top-space': topSpace
    });
    return (
      <div className={classes} style={style} {...otherProps}>
        {label}
      </div>
    );
  }
}

FormSection.propTypes = {
  className: PropTypes.string,
  style: PropTypes.object,
  label: PropTypes.node,
  topSpace: PropTypes.bool
};
