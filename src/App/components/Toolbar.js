import React, { Component } from 'react';
import classNames from 'classnames';

import { HeaderRow, IconButton, Navigation } from 'react-mdl';

export default class Toolbar extends Component {
    // TODO: Fix empty title issue
    static propTypes = {
        className: React.PropTypes.string,
        title: React.PropTypes.node,
        leftNavIcon: React.PropTypes.string,
        onLeftNavItemClicked: React.PropTypes.func,
        hideSpacer: React.PropTypes.bool
    };

    handleLeftNavClick = () => {
        if (this.props.onLeftNavItemClicked) {
            this.props.onLeftNavItemClicked();
        }
    };

    render() {
        const { children, className, hideSpacer, leftNavIcon, onLeftNavItemClicked,  title, transparent, ...otherProps } = this.props;

        const headerClasses = classNames('mdl-toolbar__header', 'mdl-layout__header', 'mdl-layout__header--transparent', className);
        const headerRowClasses = classNames('mdl-toolbar__header-row', {'mdl-toolbar__header-row-with-left-icon' : leftNavIcon});
        const leftNavClasses = classNames('mdl-toolbar__left-nav');
        const rightNavClasses = classNames('mdl-toolbar__right-nav');

        return (
            <header className={headerClasses} {...otherProps}>
                {(leftNavIcon)
                    ? <IconButton className={leftNavClasses} name={leftNavIcon} onClick={this.handleLeftNavClick} />
                    : <div style={{ width: '24px'}}></div>}
                <HeaderRow className={headerRowClasses} title={title ? title : ""} hideSpacer={hideSpacer}>
                    {(children) ? <Navigation className={rightNavClasses}>{children}</Navigation> : null}
                </HeaderRow>

            </header>
        );
    }
}
