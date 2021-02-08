import React from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import cx from 'classnames';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import HeaderItem from '../_HeaderItem';
import { usePageContext } from '../PageContext';

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
  },
  rootNoInfoBar: {
    height: theme.layout.HEADER_HEIGHT,
  },
  rootInfoBar: {
    height: theme.layout.HEADER_HEIGHT + theme.layout.INFO_BAR,
  },
  header: {
    zIndex: 99,
    position: 'fixed',
    left: 0,
    height: theme.layout.HEADER_HEIGHT,
    width: '100%',
    boxShadow: '0 0 10px rgba(0,0,0,.3)',
    boxSizing: 'border-box',
    display: 'flex',
    // padding: `0 ${theme.spacing(2)}px`,
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,

    '& a': { color: theme.palette.primary.contrastText, }
  },
  headerNoInfoBar: {
    top: 0,
  },
  headerInfoBar: {
    top: theme.layout.INFO_BAR,
  },
  section: {
    display: 'flex',
    alignItems: 'center',
    height: '100%',
  },
  leftSection: {

  },
  centerSection: {
    flex: 1,
  },
  rightSection: {

  },
  item: {
    // padding: theme.spacing(),
    display: 'flex',
    alignItems: 'center',
  },
  leftItem: {

  },
  centerItem: {

  },
  rightItem: {

  },
}));

const Header = () => {
  const {
    hasInfoBar,
    state: {
      headerLeft,
      headerRight,
      headerCenter,
      hasSidebar,
      toggleSidebar,
    }
  } = usePageContext();

  const classes = useStyles();

  const renderChildren = (children, placement) => {
    if (children && (children.type === React.Fragment)) children = children.props.children;
    return React.Children.map(children, child => {
      if (!child) return null;
      if (!child) return null;
      if (child.type === HeaderItem) return child;
      return (
        <HeaderItem className={cx(classes.item, classes[`${placement}Item`])}>
          {child}
        </HeaderItem>
      );
    });
  };

  return (
    <div
      className={cx(classes.root, {
        [classes.rootNoInfoBar]: !hasInfoBar,
        [classes.rootInfoBar]: hasInfoBar,
      })}
    >
      <div
        className={cx(classes.header, {
          [classes.headerNoInfoBar]: !hasInfoBar,
          [classes.headerInfoBar]: hasInfoBar,
        })}
      >
        {hasSidebar && renderChildren(
          <HeaderItem className={cx(classes.item, classes.leftItem)}>
            <IconButton onClick={() => toggleSidebar()} size="small">
              <MenuIcon />
            </IconButton>
          </HeaderItem>,
          'left',
        )}

        <div className={cx(classes.section, classes.leftSection)}>
          {renderChildren(headerLeft, 'left')}
        </div>

        <div className={cx(classes.section, classes.centerSection)}>
          {renderChildren(headerCenter, 'center')}
        </div>

        <div className={cx(classes.section, classes.rightSection)}>
          {renderChildren(headerRight, 'right')}
        </div>
      </div>
    </div>
  );
};


export default Header;
