/* global fetch, alert, window */
import React from 'react';
import { Link } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import MenuItem from '@material-ui/core/MenuItem';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import Logo from '@/components/Logo';
import OverlayLoader from '@/components/OverlayLoader';
import UserMenu from '@/components/UserMenu';
import { useAppContext } from '@/AppContext';
import { usePageContext, SidebarItem, HeaderItem } from '@/components/Layout';

function NavMenu() {
  const { navMenu, toggleSidebar, screenType } = usePageContext();
  const { setState, state: appState } = useAppContext();
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    navMenu.setInfoBar(
      <>
        <Typography noWrap variant="caption">You're in {appState.viewMode} mode.</Typography>

        {appState.authenticatedUser && (appState.authenticatedUser.role === 2) && (
            <>
                &nbsp;
                <Link
                    to="#"
                    onClick={() => {
                        (async () => {
                            const viewMode = appState.viewMode === 'development' ? 'view' : 'development';
                            setState({ viewMode });
                            await fetch('/set-view-mode', {
                                headers: { 'Content-Type': 'application/json' },
                                method: 'POST',
                                body: JSON.stringify({ viewMode }),
                            });
                        })();
                    }}
                >
                    <Typography variant="caption" color="primary">Switch to {appState.viewMode === 'development' ? 'view' : 'development'} mode</Typography>
                </Link>&nbsp;

                {appState.viewMode === 'view' ?
                    <Typography noWrap variant="caption">to make changes</Typography>
                    :
                    (
                        <>
                        {appState.shouldBackup && (
                            <>
                            <Button
                                size="small"
                                variant="contained"
                                color="secondary"
                                disableElevation
                                onClick={async () => {
                                setLoading(true);
                                try {
                                    const res = await fetch('/discard-changes', { method: 'POST' });
                                    const { errors } = await res.json();
                                    if (errors && errors.length) return alert(JSON.stringify(errors));
                                    window.location.reload();
                                } catch (e) { alert(e.message); }
                                setLoading(false);
                                }}
                            >Discard changes</Button>&nbsp;

                            <Button
                                size="small"
                                variant="contained"
                                color="secondary"
                                disableElevation
                                onClick={async () => {
                                setLoading(true);
                                try {
                                    const res = await fetch('/publish-changes', { method: 'POST' });
                                    const { errors } = await res.json();
                                    if (errors && errors.length) return alert(JSON.stringify(errors));
                                    window.location.reload();
                                } catch (e) { alert(e.message); }
                                setLoading(false);
                                }}
                            >Publish</Button>
                            </>
                        )}
                        </>
                    )}
            </>
        )}
      </>
    );

    navMenu.setHeaderLeft(
      <>
        {screenType !== 'desktop' && (
          <HeaderItem padded={false}>
            <IconButton
              color="inherit"
              onClick={() => toggleSidebar()}
            ><MenuIcon /></IconButton>
          </HeaderItem>
        )}

        <Link to="/"><Logo color="light" /></Link>

        <Typography variant="subtitle1">v{appState.version || 1}</Typography>

        <Typography variant="subtitle1">NeoTree</Typography>
      </>
    );

    navMenu.setHeaderRight(
      <>
        <UserMenu />
      </>
    );

    navMenu.setSidebarCenter(
      <>
        <SidebarItem padded={false}>
          <MenuItem
            component={Link}
            to="/scripts"
            selected={appState.navSection === 'scripts'}
          >
            <Typography noWrap>Scripts</Typography>
          </MenuItem>
        </SidebarItem>

        <SidebarItem padded={false}>
          <MenuItem
            component={Link}
            to="/config-keys"
            selected={appState.navSection === 'configKeys'}
          >
            <Typography noWrap>Configuration</Typography>
          </MenuItem>
        </SidebarItem>

        <SidebarItem padded={false}>
          <MenuItem
            component={Link}
            to="/users"
            selected={appState.navSection === 'users'}
          >
            <Typography noWrap>Users</Typography>
          </MenuItem>
        </SidebarItem>

        <SidebarItem padded={false}>
          <MenuItem
            component={Link}
            to="/hospitals"
            selected={appState.navSection === 'hospitals'}
          >
            <Typography noWrap>Hospitals</Typography>
          </MenuItem>
        </SidebarItem>

        <SidebarItem padded={false}>
          <MenuItem
            component={Link}
            to="/settings"
            selected={appState.navSection === 'settings'}
          >
            <Typography noWrap>Settings</Typography>
          </MenuItem>
        </SidebarItem>
      </>
    );

    return () => {
      navMenu.setInfoBar(null);
      navMenu.setHeaderLeft(null);
      navMenu.setHeaderRight(null);
    };
  }, [appState, screenType]);

  return (
    <>
      {loading && <OverlayLoader />}
    </>
  );
}

export default NavMenu;
