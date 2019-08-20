/* global document, window, HTMLElement */
import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import cx from 'classnames';
import './index.scss';

const Snackbar = React.forwardRef(({
  children,
  className,
  root,
  ...props
}, ref) => {
  ref = ref || useRef();

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [visible, setVisibility] = useState(false);
  const [style, setStyle] = useState({});
  let mountTimeOut = null;

  const _setStyle = () => {
    if (ref.current) {
      const boundingRect = ref.current.getBoundingClientRect();
      setStyle({ left: (windowWidth / 2) - (boundingRect.width / 2) });
    }
  };

  useEffect(() => { _setStyle(); }, [ref]);

  useEffect(() => {
    mountTimeOut = setTimeout(() => setVisibility(true), 25);
  }, []);

  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', onResize, true);

    return () => {
      clearTimeout(mountTimeOut);
      window.removeEventListener('resize', onResize, true);
    };
  }, []);

  return createPortal(
    <div
      {...props}
      ref={ref}
      className={cx(className, 'ui__snackbar', { visible })}
      style={Object.assign({}, props.style, style)}
    >
      {children}
    </div>,
    root || document.body
  );
});

Snackbar.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  style: PropTypes.object,
  root: PropTypes.instanceOf(HTMLElement)
};

export default Snackbar;
