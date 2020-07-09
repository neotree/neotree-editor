import React from 'react';
import PropTypes from 'prop-types';
import { Layout, LayoutItem } from '@/components/Layout';
import Logo from '@/components/Logo';
import { Link } from 'react-router-dom';
import copy from '@/constants/copy';
import Typography from '@material-ui/core/Typography';
import UserMenu from '@/components/UserMenu';
import List from '@material-ui/core/List';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemLink from '@/components/ListItemLink';

export default function AuthenticatedUserLayout(props) {
  return (
    <>
      <Layout
        {...props}
        header={(
          <>
            <Link to="/"><Logo size={40} /></Link>

            <LayoutItem>
              {({ state: { HEADER_TITLE } }) => (
                <Typography noWrap>
                  {copy.APP_TITLE}{HEADER_TITLE ? ` / ${HEADER_TITLE}` : null}
                </Typography>
              )}
            </LayoutItem>

            <div style={{ marginLeft: 'auto' }} />

            <UserMenu />
          </>
        )}

        drawer={(
          <LayoutItem>
            {({ setState, state: { viewport } }) => {
              const hideDrawer = () => viewport !== 'desktop' && setState({ DISPLAY_DRAWER: false });

              return (
                <List component="nav">
                  <ListItemLink onClick={() => hideDrawer()} to="/scripts">
                    <ListItemText primary="Scripts" />
                  </ListItemLink>

                  <ListItemLink onClick={() => hideDrawer()} to="/config-keys">
                    <ListItemText primary="Configuration" />
                  </ListItemLink>

                  <ListItemLink onClick={() => hideDrawer()} to="/settings">
                    <ListItemText primary="Settings" />
                  </ListItemLink>
                </List>
              );
            }}
          </LayoutItem>
        )}
      />
    </>
  );
}

AuthenticatedUserLayout.propTypes = {
  children: PropTypes.node,
};
