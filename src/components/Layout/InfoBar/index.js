import React from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import cx from 'classnames';
import { usePageContext } from '../PageContext';

const useStyles = makeStyles(theme => ({
  root: {
    zIndex: 99,
    position: 'fixed',
    left: 0,
    height: theme.layout.INFO_BAR,
    width: '100%',
    padding: 5,
    boxSizing: 'border-box',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.palette.background.paper,
  },
  content: {
    margin: 'auto',
    display: 'flex',
    alignItems: 'center',
  },
}));

const InfoBar = () => {
  const { state: { infoBar } } = usePageContext();
  const classes = useStyles();

  return (
    <div className={cx(classes.root)}>
      <div className={cx(classes.content)}>
        {infoBar}
      </div>
    </div>
  );
};


export default InfoBar;
