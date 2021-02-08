/* global fetch */
import React from 'react';
import io from 'socket.io-client';
import * as defaults from './_defaults';

const socket = io();

export const AppContext = React.createContext(null);

export const useAppContext = () => React.useContext(AppContext);

export const setDocumentTitle = (t = '') => {
  const { setState } = useAppContext();
  React.useEffect(() => {
    setState({ documentTitle: t });
    return () => setState({ documentTitle: '' });
  }, [t]);
};

export const setNavSection = navSection => {
  const { setState } = useAppContext();
  React.useEffect(() => {
    setState({ navSection });
    return () => setState({ navSection: null });
  }, [navSection]);
};

export const provideAppContext = Component => function AppContextProvider(props) {
  const [state, _setState] = React.useState(defaults.defaultState);

  const value = new (class AppContextValue {
    state = state;

    _setState = _setState;

    setState = s => this._setState(prev => ({
      ...prev,
      ...(typeof s === 'function' ? s(prev) : s),
    }));
  })();

  const getBackupStatus = () => new Promise((resolve, reject) => {
    (async () => {
      try {
        const res = await fetch('/get-backup-status');
        const { shouldBackup, appInfo } = await res.json();
        // value.setState({
        //   shouldBackup,
        //   version: appInfo ? appInfo.version : 1
        // });
        resolve({ shouldBackup, appInfo });
      } catch (e) { reject(e); }
    })();
  });

  React.useEffect(() => {
    getBackupStatus();
    socket.on('data_updated', getBackupStatus);
  }, []);

  console.log(state.shouldBackup);

  return (
    <AppContext.Provider
      value={value}
    >
      <Component {...props} />
    </AppContext.Provider>
  );
};
