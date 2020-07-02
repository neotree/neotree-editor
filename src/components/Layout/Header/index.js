import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Paper from '@material-ui/core/Paper';
import makeStyles from '../makeStyles';

const useStyles = makeStyles(theme => ({
  header: {
    width: '100%',
    boxSizing: 'border-box',
  },
  headerHeight: ({ _layout }) => ({
    height: _layout.HEADER_HEIGHT,
    boxSizing: 'border-box',
  }),
  contentBar: {
    position: 'fixed',
    top: 0,
    left: 0,
    height: 'inherit',
    width: '100%',
    boxSizing: 'border-box',
  },
  contentBarZIndex: ({ HEADER_ZINDEX }) => ({ zIndex: HEADER_ZINDEX }),
  content: {
    padding: `${theme.spacing()}px ${theme.spacing(2)}px`,
    height: 'inherit',
    width: '100%',
    margin: 'auto',
    display: 'flex',
    alignItems: 'center',
    boxSizing: 'border-box',
    color: theme.palette.primary.contrastText,
    backgroundColor: theme.palette.primary.main,

    '& > *:not(:last-child)': {
      marginRight: theme.spacing(2),
    }
  },
}));

export default function LayoutHeader({
  className,
  ...props
}) {
  const classes = useStyles();

  return (
    <>
      <div
        className={cx(classes.header, classes.headerHeight)}
      >
        <div
          className={cx(classes.contentBar, classes.contentBarZIndex)}
        >
          <Paper
            {...props}
            square
            elevation={3}
            className={cx(className, classes.content)}
          />
        </div>
      </div>
    </>
  );
}

LayoutHeader.propTypes = {
  className: PropTypes.string,
};
