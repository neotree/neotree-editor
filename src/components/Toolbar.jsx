/*
 * The MIT License (MIT)
 * Copyright (c) 2016 Ubiqueworks Ltd and contributors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify,
 * merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
 * TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
 * SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE
 * OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */

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
