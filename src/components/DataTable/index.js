import React from 'react';
import PropTypes from 'prop-types';
import TableContainer from '@material-ui/core/TableContainer';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import Typography from '@material-ui/core/Typography';
import makeStyles from '@material-ui/core/styles/makeStyles';
import cx from 'classnames';
import update from 'immutability-helper';
import Body from './Body';

const useStyles = makeStyles(theme => ({
  table: { minWidth: 800 },
  tableHeadRow: { transform: 'scale(1)', height: 60, },
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
  data: _data,
  onSortData,
  displayFields,
  renderHeaderActions,
}) {
  const classes = useStyles();
  const [selected, setSelected] = React.useState([]);
  const [data, setData] = React.useState(_data);

  React.useEffect(() => { setData(_data); }, [_data]);

  React.useEffect(() => {
    if (JSON.stringify(data) !== JSON.stringify(_data)) {
      setData(data);
      if (onSortData) onSortData(data);
    }
  }, [data]);

  return (
    <>
      <TableContainer component={Paper}>
        <Table className={cx(classes.table)}>
          <TableHead>
            <TableRow className={cx(classes.tableHeadRow)}>
              <TableCell>
                <div className={cx(classes.header)}>
                  <Typography variant="h5">{title}</Typography>
                  <div style={{ marginLeft: 'auto' }} />
                  {renderHeaderActions && renderHeaderActions({ selected })}
                </div>
              </TableCell>
              <TableCell />
              {displayFields.map((f, i) => (
                <TableCell key={`header${f.key}${i}`} />
              ))}
              <TableCell />
            </TableRow>
          </TableHead>

          <Body
            rows={data}
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
      </TableContainer>
    </>
  );
}

DataTable.propTypes = {
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
