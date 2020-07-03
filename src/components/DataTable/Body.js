import React from 'react';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableBody from '@material-ui/core/TableBody';
import Checkbox from '@material-ui/core/Checkbox';
import { SortableContainer } from 'react-sortable-hoc';
import Row from './Row';

export default SortableContainer(({
  rows,
  classes,
  selected,
  setSelected,
  displayFields,
}) => (
  <TableBody>
    <TableRow>
      <TableCell padding="none">
        <Checkbox
          checked={false}
          indeterminate={selected.length > 0 && selected.length < rows.length}
          checked={rows.length > 0 && selected.length === rows.length}
          onChange={() => setSelected(selected =>
            selected.length < rows.length ? rows.map(r => r.id) : [])}
        />
      </TableCell>
      <TableCell />
      {displayFields.map((f, i) => (
        <TableCell key={`${f.key}${i}`}>
          <b>{f.label}</b>
        </TableCell>
      ))}
      <TableCell align="right">
        <b>Action</b>
      </TableCell>
    </TableRow>

    {rows.map((row, i) => (
      <Row
        key={`${row.id}${i}`}
        row={row}
        index={i}
        classes={classes}
        displayFields={displayFields}
        selected={selected}
        setSelected={setSelected}
      />
    ))}
  </TableBody>
));
