import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import Header from './Header';
import Drawer from './Drawer';
import LayoutItem from './LayoutItem';
import makeStyles from './utils/makeStyles';

const useStyles = makeStyles(theme => ({
  contentWrap: ({ _layout, hasDrawer }) => ({
    transition: 'margin-left .3s',
    marginLeft: hasDrawer && _layout.viewport === 'desktop' ? _layout.DRAWER_WIDTH : 0,
  }),
  content: {
    padding: theme.spacing(2),
    boxSizing: 'border-box',
    width: '100%',
    maxWidth: 1000,
    margin: '0 auto',
  },
}));

export default function Layout({
  header,
  drawer,
  className,
  ...props
}) {
  const hasDrawer = !!drawer;
  const hasHeader = !!header;

  const classes = useStyles({ hasDrawer, hasHeader });

  return (
    <>
      <LayoutItem>
        {({ setState, state: { viewport } }) => {
          return (
            <>
              <Header hasDrawer={hasDrawer}>
                {hasDrawer && viewport !== 'desktop' && (
                  <IconButton
                    size="small"
                    color="inherit"
                    onClick={() => setState(({ DISPLAY_DRAWER }) => ({
                      DISPLAY_DRAWER: !DISPLAY_DRAWER,
                    }))}
                  >
                    <MenuIcon />
                  </IconButton>
                )}
                {header}
              </Header>

              {hasDrawer && (
                <Drawer hasHeader={hasHeader}>
                  {drawer}
                </Drawer>
              )}
            </>
          );
        }}
      </LayoutItem>

      <div className={cx(classes.contentWrap)}>
        <div
          {...props}
          className={cx(className, classes.content)}
        />
      </div>
    </>
  );
}

Layout.propTypes = {
  className: PropTypes.string,
  header: PropTypes.node,
  drawer: PropTypes.node,
};
