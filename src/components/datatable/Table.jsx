/*
 * The MIT License (MIT)
 * Copyright (c) 2016 Ubiqueworks Ltd and contributors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify,
 * merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
 * TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
 * SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE
 * OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */

import React, { Component } from 'react';
import classNames from 'classnames';
import clamp from 'clamp';
import shadows from '../../utils/shadows';
import randomstring from 'randomstring';

import { IconButton } from 'react-mdl';

import { SortableContainer, SortableElement, SortableHandle, arrayMove } from 'react-sortable-hoc';

export default class Table extends Component {

    static propTypes = {
        className: React.PropTypes.string,
        onSort: React.PropTypes.func,
        rowKeyColumn: React.PropTypes.string,
        rows: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
        shadow: React.PropTypes.number
    };

    // handleLeftNavClick = () => {
    //     if (this.props.onLeftNavItemClicked) {
    //         this.props.onLeftNavItemClicked();
    //     }
    // };
    //
    // render() {
    //     const { children, className, hideSpacer, leftNavIcon, onLeftNavItemClicked,  title, transparent, ...otherProps } = this.props;
    //
    //     const headerClasses = classNames('mdl-toolbar__header', 'mdl-layout__header', 'mdl-layout__header--transparent', className);
    //     const headerRowClasses = classNames('mdl-toolbar__header-row', {'mdl-toolbar__header-row-with-left-icon' : leftNavIcon});
    //     const leftNavClasses = classNames('mdl-toolbar__left-nav');
    //     const rightNavClasses = classNames('mdl-toolbar__right-nav');
    //
    //     return (
    //         <header className={headerClasses} {...otherProps}>
    //             {(leftNavIcon)
    //                 ? <IconButton className={leftNavClasses} name={leftNavIcon} onClick={this.handleLeftNavClick} />
    //                 : <div style={{ width: '24px'}}></div>}
    //             <HeaderRow className={headerRowClasses} title={title ? title : ""} hideSpacer={hideSpacer}>
    //                 {(children) ? <Navigation className={rightNavClasses}>{children}</Navigation> : null}
    //             </HeaderRow>
    //
    //         </header>
    //     );
    // }


    renderCell = (column, row, idx) => {
        const className = !column.numeric ? 'mdl-data-table__cell--non-numeric' : '';
        return (
            <td key={column.name} className={className}>
                {column.cellFormatter ? column.cellFormatter(row[column.name], row, idx) : row[column.name]}
            </td>
        );
    };

    sortAdapterFn = ({oldIndex, newIndex}) => {
        const { onSort } = this.props;
        if (onSort) {
            onSort(oldIndex, newIndex);
        }
    };

    render() {
        const { className, shadow, children, onSort, rowKeyColumn, rows, ...otherProps } = this.props;
        const hasShadow = typeof shadow !== 'undefined';
        const shadowLevel = clamp(shadow || 0, 0, shadows.length - 1);

        const classes = classNames('mdl-data-table', {
            [shadows[shadowLevel]]: hasShadow
        }, className);

        const columnChildren = !!children ? React.Children.toArray(children) : null;

        const RowHandle = SortableHandle(() => <IconButton name="drag_handle" />);

        const TableRow = SortableElement(({row, index}) =>
            <tr className={row.className}>
                <td><RowHandle /></td>
                {columnChildren.map((child) => this.renderCell(child.props, row, index))}
            </tr>
        );

        const TableBody = SortableContainer(({rows}) => {
            return (
                <tbody>
                    {rows.map((row, index) =>
                        <TableRow key={randomstring.generate()} index={index} row={row} />
                    )}
                </tbody>
            );
        });

        return (
            <table className={classes} {...otherProps}>
                <thead>
                <tr>
                    <th>&nbsp;</th>
                    {columnChildren}
                </tr>
                </thead>
                <TableBody rows={rows} onSortEnd={this.sortAdapterFn} useDragHandle={true} />
            </table>
        );
    }

}
