import React from 'react';
import TableBody from '@material-ui/core/TableBody';
import { SortableContainer } from 'react-sortable-hoc';
import Row from './Row';

export default SortableContainer(({
  rows,
  sortable,
  classes,
  selected,
  selectable,
  setSelected,
  displayFields,
  renderRowAction,
}) => (
  <TableBody>
    {rows.map((row, i) => {
      const key = i;
      return (
        <Row
          key={`${key}${i}`}
          row={row}
          sortable={sortable}
          index={i}
          rowIndex={i}
          classes={classes}
          selectable={selectable}
          action={renderRowAction ? renderRowAction(row, i) || <></> : null}
          displayFields={displayFields}
          selected={selected}
          setSelected={setSelected}
        />
      );
    })}
  </TableBody>
));
