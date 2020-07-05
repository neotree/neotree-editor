import React from 'react';
import PropTypes from 'prop-types';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import Typography from '@material-ui/core/Typography';
import Checkbox from '@material-ui/core/Checkbox';
import Divider from '@material-ui/core/Divider';
import makeStyles from '@material-ui/core/styles/makeStyles';
import cx from 'classnames';
import update from 'immutability-helper';
import Body from './Body';

const useStyles = makeStyles(theme => ({
  table: { minWidth: 800 },
  headerWrap: { position: 'relative', height: 60, },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    boxSizing: 'border-box',
    padding: theme.spacing(),
  },
  dataItemRow: {
    '&:hover, &.selected': {
      backgroundColor: theme.palette.action.hover,
    }
  }
}));

function DataTable({
  title,
  selectable,
  renderRowAction,
  data: _data,
  onSortData,
  displayFields,
  renderHeaderActions,
}) {
  selectable = selectable !== false;
  const classes = useStyles();
  const [selected, setSelected] = React.useState([]);
  const [data, setData] = React.useState(_data);

  React.useEffect(() => { setData(_data); }, [_data]);

  React.useEffect(() => {
    if (JSON.stringify(data) !== JSON.stringify(_data)) {
      const stateData = data.map((item, i) => ({ ...item, position: i + 1, }));
      setData(stateData);
      if (onSortData) onSortData(stateData);
    }
  }, [data]);

  return (
    <>
      <Paper>
        <div className={cx(classes.headerWrap)}>
          <div className={cx(classes.header)}>
            <Typography variant="h5">{title}</Typography>
            <div style={{ marginLeft: 'auto' }} />
            {renderHeaderActions && renderHeaderActions({ selected })}
          </div>
        </div>

        <Divider />

        <Table className={cx(classes.table)}>
          <TableHead>
            <TableRow>
              {selectable && (
                <TableCell padding="none">
                  <Checkbox
                    checked={false}
                    indeterminate={selected.length > 0 && selected.length < data.length}
                    checked={data.length > 0 && selected.length === data.length}
                    onChange={() => setSelected(selected =>
                      selected.length < data.length ? data.map(r => r.id) : [])}
                  />
                </TableCell>
              )}
              <TableCell />
              {displayFields.map((f, i) => (
                <TableCell key={`${f.key}${i}`}>
                  <b>{f.label}</b>
                </TableCell>
              ))}
              {!renderRowAction ? null : (
                <TableCell align="right">
                  <b>Action</b>
                </TableCell>
              )}
            </TableRow>
          </TableHead>

          <Body
            rows={data}
            selectable={selectable}
            renderRowAction={renderRowAction}
            classes={classes}
            displayFields={displayFields}
            selected={selected}
            setSelected={setSelected}
            useDragHandle
            onSortEnd={({ oldIndex, newIndex }) => setData(data =>
              update(data, {
                $splice: [
                  [oldIndex, 1],
                  [newIndex, 0, data[oldIndex]],
                ],
              })
            )}
          />
        </Table>
      </Paper>
    </>
  );
}

DataTable.propTypes = {
  selectable: PropTypes.bool,
  renderRowAction: PropTypes.func,
  title: PropTypes.string.isRequired,
  displayFields: PropTypes.array.isRequired,
  renderHeaderActions: PropTypes.func,
  onSortData: PropTypes.func,
  data: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string.isRequired,
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.array]).isRequired
  })).isRequired
};

export default DataTable;
