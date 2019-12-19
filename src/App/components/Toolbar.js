import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { HeaderRow, Navigation } from 'react-mdl';
import { MdArrowBack } from 'react-icons/md';

export default class Toolbar extends Component {
  handleLeftNavClick = () => {
    if (this.props.onLeftNavItemClicked) {
      this.props.onLeftNavItemClicked();
    }
  };

  render() {
    const {
      children,
      className,
      hideSpacer,
      leftNavIcon,
      onLeftNavItemClicked, 
      title,
      transparent, 
      ...otherProps
    } = this.props;

    const headerClasses = cx(className, 'mdl-toolbar__header', 'mdl-layout__header', 'mdl-layout__header--transparent');
    const headerRowClasses = cx('mdl-toolbar__header-row', { 'mdl-toolbar__header-row-with-left-icon': leftNavIcon });
    const leftNavClasses = cx('mdl-toolbar__left-nav');
    const rightNavClasses = cx('mdl-toolbar__right-nav');

    return (
      <header className={headerClasses} {...otherProps}>
        {leftNavIcon ?
          <div
            className={cx(leftNavClasses, 'ui__cursor_pointer')}
            style={{ fontSize: '24px' }}
            onClick={this.handleLeftNavClick}
          ><MdArrowBack /></div>
          : <div style={{ width: '24px' }} />}
        <HeaderRow className={headerRowClasses} title={title ? title : ''} hideSpacer={hideSpacer}>
          {(children) ? <Navigation className={rightNavClasses}>{children}</Navigation> : null}
        </HeaderRow>
      </header>
    );
  }
}

Toolbar.propTypes = {
    className: PropTypes.string,
    title: PropTypes.node,
    leftNavIcon: PropTypes.string,
    onLeftNavItemClicked: PropTypes.func,
    hideSpacer: PropTypes.bool
};
