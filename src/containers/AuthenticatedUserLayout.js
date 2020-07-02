import React from 'react';
import PropTypes from 'prop-types';
import { LayoutHeader, LayoutItem } from '@/components/Layout';
import Logo from '@/components/Logo';
import { Link } from 'react-router-dom';
import copy from '@/constants/copy';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import UserMenu from '@/components/UserMenu';

export default function AuthenticatedUserLayout({
  children
}) {
  return (
    <>
      <LayoutHeader>
        <LayoutItem>
          {() => (
            <IconButton size="small" color="inherit">
              <MenuIcon />
            </IconButton>
          )}
        </LayoutItem>

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
      </LayoutHeader>
      {children}
    </>
  );
}

AuthenticatedUserLayout.propTypes = {
  children: PropTypes.node,
};
