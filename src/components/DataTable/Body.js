import React from 'react';
import TableBody from '@material-ui/core/TableBody';
import { SortableContainer } from 'react-sortable-hoc';
import Row from './Row';

export default SortableContainer(({
  rows,
  classes,
  selected,
  selectable,
  setSelected,
  displayFields,
  renderRowAction,
}) => (
  <TableBody>
    {rows.map((row, i) => (
      <Row
        key={`${row.id}${i}`}
        row={row}
        index={i}
        classes={classes}
        selectable={selectable}
        action={renderRowAction ? renderRowAction(row, i) : null}
        displayFields={displayFields}
        selected={selected}
        setSelected={setSelected}
      />
    ))}
  </TableBody>
));
