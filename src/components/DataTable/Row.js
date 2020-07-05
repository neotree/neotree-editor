import React from 'react';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import Checkbox from '@material-ui/core/Checkbox';
import IconButton from '@material-ui/core/IconButton';
import cx from 'classnames';
import { SortableElement, SortableHandle } from 'react-sortable-hoc';
import DragHandleIcon from '@material-ui/icons/DragHandle';

const DragHandle = SortableHandle(() => (
  <IconButton style={{ cursor: 'move' }}>
    <DragHandleIcon />
  </IconButton>
));

export default SortableElement(({
  row,
  classes,
  selected,
  setSelected,
  displayFields,
  action,
}) => (
  <TableRow
    className={cx(classes.dataItemRow, {
      selected: selected.indexOf(row.id) > -1,
    })}
  >
    <TableCell padding="none">
      <Checkbox
        checked={selected.indexOf(row.id) > -1}
        onChange={() => setSelected(selected => selected.indexOf(row.id) > -1 ?
          selected.filter(id => id !== row.id)
          :
          [...selected, row.id])}
      />
    </TableCell>
    <TableCell padding="none">
      <DragHandle />
    </TableCell>
    {displayFields.map((f, i) => (
      <TableCell key={`${row.id}${f.key}${i}`}>
        {row[f.key]}
      </TableCell>
    ))}
    {!action ? null : (
      <TableCell align="right">
        {action}
      </TableCell>
    )}
  </TableRow>
));
