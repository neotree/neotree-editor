import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import './index.scss';

export class Sidebar extends React.Component {
  render() {
    const { className, children, ...props } = this.props;

    return (
      <div
        {...props}
        data-ui__layout-sidebar
        data-ui__layout-item
        className={cx(className, 'ui__layoutSidebar')}
      >
        {children}
      </div>
    );
  }
}

Sidebar.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node
};

export default Sidebar;
