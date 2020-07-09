/* global window */
import React from 'react';
import PropTypes from 'prop-types';


const WindowEventListener = ({ children, events }) => {
  events = events || {};
  
  React.useEffect(() => {
    const setOrUnsetEvent = setOrUnsetEvent => Object.keys(events)
      .forEach(event => {
        const onEvent = events[event];
        if (onEvent) window[setOrUnsetEvent](event, onEvent, true);
      });

    setOrUnsetEvent('addEventListener');

    return () => { setOrUnsetEvent('removeEventListener'); };
  });

  return <>{children}</>;
};

WindowEventListener.propTypes = {
  children: PropTypes.any,
  events: PropTypes.object
};

export default (WindowEventListener);
