import React from 'react';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { provideAppContext, useAppContext } from '@/AppContext';
import PageLoader from '@/components/PageLoader';
import DocumentTitle from '@/components/DocumentTitle';
import Containers from './containers';

const theme = createMuiTheme({
  palette: {
    primary: { main: '#2980b9' },
    secondary: { main: '#f39c12' },
  },
  layout: {
    SIDEBAR_WIDTH: 250,
    HEADER_HEIGHT: 60,
  },
});

const App = () => {
  const { socket, state: { appInitialised } } = useAppContext();

  React.useEffect(() => {
    socket.on('data_updated', data => console.log('socket: data_updated', data)); // eslint-disable-line
  }, []);

  return (
    <MuiThemeProvider theme={theme}>
      {!appInitialised ? <PageLoader /> : (
        <>
          <DocumentTitle />
          <Containers />
        </>
      )}
    </MuiThemeProvider>
  );
};

export default provideAppContext(App);
