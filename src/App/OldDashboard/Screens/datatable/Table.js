import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import clamp from 'clamp';
import { MdDragHandle } from 'react-icons/md';
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';
import randomstring from 'randomstring';
import shadows from 'App/utils/shadows'; // eslint-disable-line

export default class Table extends Component {
    static propTypes = {
        className: PropTypes.string,
        onSort: PropTypes.func,
        rowKeyColumn: PropTypes.string,
        rows: PropTypes.arrayOf(PropTypes.object).isRequired,
        shadow: PropTypes.number
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

        const RowHandle = SortableHandle(() =>
          <MdDragHandle style={{ fontSize: '24px' }} className="ui__cursor_pointer" />);

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
