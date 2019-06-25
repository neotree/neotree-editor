import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { HeaderRow, IconButton, Navigation } from 'react-mdl';

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
      onLeftNavItemClicked, // eslint-disable-line
      title,
      transparent, // eslint-disable-line
      ...otherProps
    } = this.props;

    const headerClasses = classNames(className, 'mdl-toolbar__header', 'mdl-layout__header', 'mdl-layout__header--transparent');
    const headerRowClasses = classNames('mdl-toolbar__header-row', { 'mdl-toolbar__header-row-with-left-icon': leftNavIcon });
    const leftNavClasses = classNames('mdl-toolbar__left-nav');
    const rightNavClasses = classNames('mdl-toolbar__right-nav');

    return (
      <header className={headerClasses} {...otherProps}>
        {leftNavIcon ?
          <IconButton
            className={leftNavClasses}
            name={leftNavIcon}
            onClick={this.handleLeftNavClick}
          />
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
