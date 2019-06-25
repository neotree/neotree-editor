import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import LayoutHeader from './Header';
import LayoutBody from './Body';
import LayoutSidebar from './Sidebar';
import getChildByType from '../getChildByType';
import Context from './Context';
import './index.scss';

export class Layout extends React.Component {
  render() {
    const { className, children, title, ...props } = this.props;

    const Header = getChildByType(children, LayoutHeader);
    const Body = getChildByType(children, LayoutBody);
    const Sidebar = getChildByType(children, LayoutSidebar);

    const withLayoutSidebar = Sidebar ? true : false;
    const withLayoutHeader = Header ? true : false;

    return (
      <Context.Provider
        value={{ container: this, withLayoutHeader, withLayoutSidebar }}
      >
        <div
          {...props}
          ref={el => (this.layout = el)}
          className={cx(className, 'ui__layout', {
            hasHeader: Header,
            hasBody: Body,
            hasSidebar: Sidebar
          })}
        >
          <Header title={title} />
          <Sidebar />
          <Body />
        </div>
      </Context.Provider>
    );
  }
}

Layout.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  title: PropTypes.node
};

export * from './Header';
export { default as LayoutBody } from './Body';
export { default as LayoutSidebar } from './Sidebar';
export default Layout;
