import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Context from './Context';
import Toggler from './Toggler';
import './index.scss';

export class DropDown extends React.Component {
  state = {
    open: false,
    align: 'right'
  };

  componentDidMount() {
    global.document.addEventListener('pointerdown', this.onBlur, true);
  }

  componentWillUpdate(nextProps, nextState) {
    if (nextState.open) this.alignTray();
  }

  componentWillUnmount() {
    global.document.removeEventListener('pointerdown', this.onBlur, true);
  }

  onBlur = e => {
    if (this.state.open) {
      const boundingRect = this.tray.getBoundingClientRect();
      const targetBoundingRect = e.target.getBoundingClientRect();
      const isBlur = (e.screenX < boundingRect.left) ||
        (e.screenX > boundingRect.right) ||
        (targetBoundingRect.top < boundingRect.top) ||
        (targetBoundingRect.bottom > boundingRect.bottom);
      if (isBlur && !this.togglerIsClicked(e)) this.toggle();
    }
  };

  togglerIsClicked = (e) => {
    if (!this.toggler) return false;
    const boundingRect = this.toggler.getBoundingClientRect();
    const targetBoundingRect = e.target.getBoundingClientRect();
    return !((e.screenX < boundingRect.left) ||
      (e.screenX > boundingRect.right) ||
      (targetBoundingRect.top < boundingRect.top) ||
      (targetBoundingRect.bottom > boundingRect.bottom));
  };

  toggle = () => this.setState({ open: !this.state.open });

  alignTray = () => {
    const boundingRect = this.tray.getBoundingClientRect();
    if (boundingRect.right > global.window.innerWidth) {
      this.setState({ align: 'left' });
    }
  };

  render() {
    const { className, children, toggler, ...props } = this.props;
    const { open, align } = this.state;

    return (
      <Context.Provider value={this}>
        <div
          className={cx(className, 'ui__dropdown', { open })}
        >
          {toggler ?
            <Toggler innerRef={el => (this.toggler = el)}>
              {toggler}
            </Toggler> : null}

          <div
            {...props}
            ref={el => (this.tray = el)}
            className={cx('ui__dropdownTray', `align__${align}`, {
              open,
              ui__shadow: true 
            })}
          >
            {children}
          </div>
        </div>
      </Context.Provider>
    );
  }
}

DropDown.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  toggler: PropTypes.node
};

export { Toggler as DropDownToggler };
export default DropDown;
