import React from 'react';
import { useParams } from 'react-router-dom';
import _getScreens from './_getScreens';
import _deleteScreens from './_deleteScreens';
import _updateScreens from './_updateScreens';
import _duplicateScreens from './_duplicateScreens';

export const ScreensContext = React.createContext(null);

export const useScreensContext = () => React.useContext(ScreensContext);

export const provideScreensContext = Component => function ScreensContextProvider(props) {
  const { scriptId, } = useParams();

  const [state, _setState] = React.useState({
    screens: [],
  });
  const setState = s => _setState(prev => ({
    ...prev,
    ...typeof s === 'function' ? s(prev) : s
  }));

  const getScreens = _getScreens({ setState });
  const deleteScreens = _deleteScreens({ setState });
  const updateScreens = _updateScreens({ setState });
  const duplicateScreens = _duplicateScreens({ setState });

  React.useEffect(() => { getScreens({ script_id: scriptId }); }, []);

  return (
    <ScreensContext.Provider
      value={{
        state,
        setState,
        _setState,
        getScreens,
        deleteScreens,
        updateScreens,
        duplicateScreens,
      }}
    >
      <Component {...props} />
    </ScreensContext.Provider>
  );
};
