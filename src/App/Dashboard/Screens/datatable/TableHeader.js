import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

export default class TableHeader extends Component {
    static propTypes = {
        cellFormatter: PropTypes.func,
        className: PropTypes.string,
        name: PropTypes.string.isRequired,
        numeric: PropTypes.bool
    };

    render() {
        const { className, name, numeric, children, cellFormatter, ...otherProps } = this.props;

        const classes = classNames({
            'mdl-data-table__cell--non-numeric': !numeric
        }, className);

        return (
            <th className={classes} {...otherProps}>
                {children}
            </th>
        );
    }
}
