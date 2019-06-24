import React, { Component } from 'react';
import classNames from 'classnames';

export default class FormSection extends Component {

    static propTypes = {
        className: React.PropTypes.string,
        style: React.PropTypes.object,
        label: React.PropTypes.node,
        topSpace: React.PropTypes.bool
    };

    render() {
        const { children, className, label, style, topSpace, ...otherProps } = this.props;
        const classes = classNames('mdl-form-section', {
            'mdl-form-section-top-space': topSpace
        }, className);
        return (
            <div className={classes} style={style} {...otherProps}>{label}</div>
        );
    }
}
