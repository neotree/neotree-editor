/* global fetch, $APP */
import React from 'react';
import io from 'socket.io-client';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import DocumentTitle from '@/components/DocumentTitle';
import Containers from './containers';
import AppContext from './AppContext';

const socket = io();

const theme = createMuiTheme({
  palette: {
    primary: { main: '#2980b9' },
    secondary: { main: '#f39c12' },
  },
  layout: {
    SIDEBAR_WIDTH: 250,
    HEADER_HEIGHT: 60,
    INFO_BAR: 40,
  },
});

const App = () => {
  const [state, _setState] = React.useState({
    documentTitle: '',
    navSection: null,
    initialisingApp: false,
    ...(() => { try { return $APP; } catch (e) { return null; } })()
  });
  const setState = s => _setState(prev => ({
    ...prev,
    ...(typeof s === 'function' ? s(prev) : s),
  }));

  const getBackupStatus = () => new Promise((resolve, reject) => {
    (async () => {
      try {
        const res = await fetch('/get-backup-status');
        const { shouldBackup, appInfo } = await res.json();
        setState({
          shouldBackup,
          version: appInfo ? appInfo.version : 1
        });
        resolve({ shouldBackup, appInfo });
      } catch (e) { reject(e); }
    })();
  });

  React.useEffect(() => {
    getBackupStatus();
    socket.on('data_updated', getBackupStatus);
  }, []);

  React.useEffect(() => {
    socket.on('data_updated', data => console.log('socket: data_updated', data)); // eslint-disable-line
  }, []);

  return (
    <AppContext.Provider value={{ state, setState, socket }}>
      <MuiThemeProvider theme={theme}>
        <DocumentTitle />
        <Containers />
      </MuiThemeProvider>
    </AppContext.Provider>
  );
};

export default App;
