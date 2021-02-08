/* global fetch, $APP */
import React from 'react';

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

export default AppContext;
