/* global window */
import React from 'react';
import { useTheme } from '@material-ui/core/styles';

const getScreenType = (theme, winWidth = window.innerWidth) => {
  if (winWidth >= theme.breakpoints.values.md) return 'desktop';
  if (winWidth <= theme.breakpoints.values.sm) return 'phone';
  return 'tablet';
};

export const PageContext = React.createContext(null);

export const usePageContext = () => React.useContext(PageContext);

export const providePageContext = Component => React.forwardRef(function PageContextProvider(props, ref) {
  const theme = useTheme();

  const [state, _setState] = React.useState({
    screenType: getScreenType(theme),
    sidebarIsVisible: false,
    headerLeft: null,
    headerRight: null,
    headerCenter: null,
    sidebarTop: null,
    sidebarCenter: null,
    sidebarBottom: null,
  });

  const setState = s => _setState(prev => ({
    ...prev,
    ...(typeof s === 'function' ? s(prev) : s),
  }));

  const {
    screenType,
    headerLeft,
    headerRight,
    headerCenter,
    sidebarTop,
    sidebarCenter,
    sidebarBottom,
    sidebarIsVisible,
  } = state;

  const hasHeader = !!(headerLeft || headerRight || headerCenter);
  const hasSidebar = !!(sidebarBottom || sidebarTop || sidebarCenter);

  React.useEffect(() => {
    const onResize = () => setState({ screenType: getScreenType(theme, window.innerWidth) });
    window.addEventListener('resize', onResize, true);
    return () => window.removeEventListener('resize', onResize, true);
  });

  React.useEffect(() => {
    if (!hasSidebar) {
      setState({ sidebarIsVisible: false });
    } else {
      setState({ sidebarIsVisible: screenType === 'desktop' });
    }
  }, [screenType, hasSidebar]);

  return (
    <PageContext.Provider
      value={{
        state,
        setState,
        screenType,
        hasHeader,
        hasSidebar,
        sidebarIsVisible,
        toggleSidebar: () => setState(s => ({ sidebarIsVisible: !s.sidebarIsVisible })),
        navMenu: {
          setHeaderLeft: headerLeft => setState({ headerLeft }),
          setHeaderRight: headerRight => setState({ headerRight }),
          setHeaderCenter: headerCenter => setState({ headerCenter }),
          setSidebarTop: sidebarTop => setState({ sidebarTop }),
          setSidebarCenter: sidebarCenter => setState({ sidebarCenter }),
          setSidebarBottom: sidebarBottom => setState({ sidebarBottom }),
        }
      }}
    >
      <Component {...props} ref={ref} />
    </PageContext.Provider>
  );
});

export default PageContext;
