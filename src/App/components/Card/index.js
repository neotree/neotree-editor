import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import './index.scss';

export class Card extends React.Component {
  state = {
    boundingRect: null,
    windowHeight: global.window.innerHeight,
    windowWidth: global.window.innerWidth
  };

  componentDidMount() {
    this._isMounted = true;
    this.setBoundingRect();
    global.window.addEventListener('resize', this.setBoundingRect, true);
    global.window.addEventListener('scroll', this.setBoundingRect, true);
  }

  componentWillUnmount() {
    if (this.timeOut) clearTimeout(this.timeOut);
    global.window.removeEventListener('resize', this.setBoundingRect, true);
    global.window.removeEventListener('scroll', this.setBoundingRect, true);
  }

  setBoundingRect = (e) => {
    const { updateOnScroll, updateOnResize } = this.props;
    if (e && (e.type === 'scroll') && !updateOnScroll) return;
    if (e && (e.type === 'resize') && updateOnResize === false) return;

    const { boundingRect } = this.state;

    if (!this.element) return this.setBoundingRect();

    this.updateState(
      {
        boundingRect: this.element.getBoundingClientRect(),
        windowHeight: global.window.innerHeight,
        windowWidth: global.window.innerWidth
      },
      () => {
        if (!boundingRect) this.timeOut = setTimeout(this.setBoundingRect, 50);
      }
    );
  };

  updateState = (s, cb) => this._isMounted && this.setState(s, cb);

  render() {
    const {
      className,
      children,
      innerRef,
      updateOnScroll, // eslint-disable-line
      updateOnResize, // eslint-disable-line
      ...props
    } = this.props;

    let _children = null;
    if (this.state.boundingRect) {
      _children = typeof children === 'function' ? children(this.state) : children;
    }

    return (
      <div
        {...props}
        ref={innerRef || (el => { this.element = el; })}
        className={cx(className, 'ui__container')}
      >{_children}</div>
    );
  }
}

Card.propTypes = {
  updateOnScroll: PropTypes.bool,
  updateOnResize: PropTypes.bool,
  className: PropTypes.string,
  innerRef: PropTypes.func,
  children: PropTypes.oneOfType([PropTypes.func, PropTypes.node])
};

export default Card;
