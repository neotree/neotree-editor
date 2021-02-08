import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import cx from 'classnames';
import { providePageContext, usePageContext } from './PageContext';
import InfoBar from './InfoBar';
import Header from './Header';
import Sidebar from './Sidebar';
import Body from './Body';

const useStyles = makeStyles(theme => ({
  '@global': {
    body: {
      margin: 0,
      padding: 0,
      backgroundColor: theme.palette.background.default,
    },
    a: {
      textDecoration: 'none',
    }
  },
  root: {

  },
  sidebarMargin: {
    marginLeft: theme.layout.SIDEBAR_WIDTH,
    transition: 'margin-left .3s',
  },
}));

const Page = React.forwardRef(({
  children,
  ...props
}, ref) => {
  const pageContext = usePageContext();
  const classes = useStyles();

  React.useImperativeHandle(ref, () => pageContext);

  const {
    hasInfoBar,
    hasSidebar,
    hasHeader,
    screenType,
    sidebarIsVisible,
  } = pageContext;

  return (
    <>
      <div
        className={cx(classes.root, {
          [classes.sidebarMargin]: sidebarIsVisible && (screenType === 'desktop'),
        })}
      >
        {hasInfoBar && <InfoBar />}

        {hasHeader && <Header />}

        {hasSidebar && <Sidebar />}

        <Body {...props}>{children}</Body>
      </div>
    </>
  );
});

Page.propTypes = {
  children: PropTypes.node,
};

export default providePageContext(Page);
