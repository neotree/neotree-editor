import React, { Component } from 'react';
import classNames from 'classnames';

export default class TableHeader extends Component {

    static propTypes = {
        cellFormatter: React.PropTypes.func,
        className: React.PropTypes.string,
        name: React.PropTypes.string.isRequired,
        numeric: React.PropTypes.bool
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
