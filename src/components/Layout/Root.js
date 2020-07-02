import React from 'react';
import PropTypes from 'prop-types';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import cx from 'classnames';
import { provideLayoutContext } from './Context';
import makeStyles from './makeStyles';

const theme = createMuiTheme({
  palette: {
    primary: { main: '#2980b9' },
    secondary: { main: '#f39c12' },
  }
});

const useStyles = makeStyles(theme => {
  return {
    '@global': {
      body: {
        margin: 0,
        padding: 0,
        backgroundColor: theme.palette.grey[100]
      }
    }
  };
});

const Root = ({ className, ...props }) => {
  const classes = useStyles();

  return (
    <>
      <MuiThemeProvider theme={theme}>
        <div
          className={cx(classes.root, className)}
          {...props}
        />
      </MuiThemeProvider>
    </>
  );
};

Root.propTypes = {
  className: PropTypes.string,
};

export default provideLayoutContext(Root);
