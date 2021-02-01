/* global window, alert, fetch */
import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { useAppContext } from '@/contexts/app';
import makeStyles from '../utils/makeStyles';

const useStyles = makeStyles(theme => ({
  header: {
    width: '100%',
    boxSizing: 'border-box',
  },
  headerHeight: ({ _layout, app }) => ({
    height: _layout.HEADER_HEIGHT,
    marginBottom: !app.shouldBackup ? 0 : _layout.HEADER_INFO_BAR,
  }),
  contentBar: ({ app, _layout }) => ({
    position: 'fixed',
    top: !app.shouldBackup ? 0 : _layout.HEADER_INFO_BAR,
    left: 0,
    height: 'inherit',
    width: '100%',
    boxSizing: 'border-box',
  }),
  contentBarZIndex: ({ _layout }) => ({ zIndex: _layout.HEADER_ZINDEX }),
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
  infoBar: ({ _layout }) => ({
    backgroundColor: theme.palette.background.paper,
    height: _layout.HEADER_INFO_BAR,
    padding: 5,
    display: 'flex',
    flexFlow: 'column',
    justifyContent: 'center',
    color: theme.palette.text.primary,
    boxSizing: 'border-box',
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: _layout.HEADER_ZINDEX,
    width: '100%',
    textAlign: 'center',
    overflow: 'hidden'
  }),
}));

export default function LayoutHeader({
  hasDrawer, // eslint-disable-line
  className,
  ...props
}) {
  const { state: app } = useAppContext();
  const classes = useStyles({ app });

  return (
    <>
      {!!app.shouldBackup && (
        <div
          className={cx(classes.infoBar)}
        >
          <div>
            <Typography noWrap variant="caption">You have changes waiting to be published</Typography>&nbsp;
            <Button
              size="small"
              color="primary"
              onClick={async () => {
                try {
                  const res = await fetch('/publish', { method: 'POST' });
                  const { errors } = await res.json();
                  if (errors && errors.length) return alert(JSON.stringify(errors));
                  window.location.reload();
                } catch (e) { alert(e.message); }
              }}
            >Publish</Button>
          </div>
        </div>
      )}

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
  hasDrawer: PropTypes.bool,
};
