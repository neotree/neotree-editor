import React from 'react';
import { Link } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import MenuItem from '@material-ui/core/MenuItem';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import Logo from '@/components/Logo';
import UserMenu from '@/components/UserMenu';
import { useAppContext } from '@/AppContext';
import { usePageContext, SidebarItem, HeaderItem } from '@/components/Layout';

function NavMenu() {
  const { navMenu, toggleSidebar, screenType } = usePageContext();
  const { state: appState } = useAppContext();

  React.useEffect(() => {
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

        <Link to="/"><Logo size={40} /></Link>

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
      navMenu.setHeaderLeft(null);
      navMenu.setHeaderRight(null);
    };
  }, [appState, screenType]);

  return null;
}

export default NavMenu;
