import React from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import cx from 'classnames';
import SidebarItem from '../_SidebarItem';
import { usePageContext } from '../PageContext';

const useStyles = makeStyles(theme => ({
  overlay: {
    position: 'fixed',
    top: theme.layout.HEADER_HEIGHT,
    left: 0,
    width: '100%',
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,.05)',
  },
  root: {
    zIndex: 99,
    position: 'fixed',
    left: 0,
    height: `calc(100% - ${theme.layout.HEADER_HEIGHT}px)`,
    width: theme.layout.SIDEBAR_WIDTH,
    borderRight: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
    boxSizing: 'border-box',
    display: 'flex',
    flexFlow: 'column',
    overflowY: 'auto',
  },
  rootNoInfoBar: {
    top: theme.layout.HEADER_HEIGHT,
  },
  rootInfoBar: {
    top: theme.layout.HEADER_HEIGHT + theme.layout.INFO_BAR,
  },
  transition: {
    transition: 'left .3s',
  },
  hidden: {
    left: -theme.layout.SIDEBAR_WIDTH,
  },
  section: {
    display: 'flex',
    flexFlow: 'column',
  },
  topSection: {

  },
  centerSection: {
    flex: 1,
    overflowY: 'auto',
  },
  bottomSection: {

  },
  item: {

  },
  topItem: {

  },
  centerItem: {

  },
  bottomItem: {

  },
}));

const Sidebar = () => {
  const {
    toggleSidebar,
    hasInfoBar,
    state: {
      screenType,
      sidebarTop,
      sidebarCenter,
      sidebarBottom,
      sidebarIsVisible,
    }
  } = usePageContext();

  const classes = useStyles();

  const renderChildren = (children, placement) => {
    if (children && (children.type === React.Fragment)) children = children.props.children;
    return React.Children.map(children, child => {
      if (!child) return null;
      if (child.type === SidebarItem) return child;
      return (
        <SidebarItem className={cx(classes.item, classes[`${placement}Item`])}>
          {child}
        </SidebarItem>
      );
    });
  };

  return (
    <>
      {sidebarIsVisible && (screenType !== 'desktop') && (
        <div onClick={() => toggleSidebar()} className={cx(classes.overlay)} />
      )}

      <div
        className={cx(classes.root, {
          [classes.hidden]: !sidebarIsVisible,
          [classes.transition]: screenType !== 'desktop',
          [classes.rootNoInfoBar]: !hasInfoBar,
          [classes.rootInfoBar]: hasInfoBar,
        })}
      >
        <div className={cx(classes.section, classes.topSection)}>
          {renderChildren(sidebarTop, 'top')}
        </div>

        <div className={cx(classes.section, classes.centerSection)}>
          {renderChildren(sidebarCenter, 'center')}
        </div>

        <div className={cx(classes.section, classes.bottomSection)}>
          {renderChildren(sidebarBottom, 'bottom')}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
