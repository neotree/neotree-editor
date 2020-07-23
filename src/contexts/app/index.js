import React from 'react';
import useContextValue from './ContextValue';

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
  const value = useContextValue();

  React.useEffect(() => { value.initialiseApp(); }, []);

  return (
    <AppContext.Provider
      value={value}
    >
      <Component {...props} />
    </AppContext.Provider>
  );
};
