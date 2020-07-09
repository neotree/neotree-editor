import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const LazyComponent = ({
  __load,
  __options: { LoaderComponent, ErrorComponent },
  ...props
}) => {
  const [component, setComponent] = useState(null);

  useEffect(() => {
    if (LoaderComponent) setComponent(<LoaderComponent />);

    __load()
      .then(rslts => {
        const Component = rslts.default || rslts;
        setComponent(<Component {...props} />);
      })
      .catch(e => {
        if (ErrorComponent) setComponent(<ErrorComponent error={e} />);
      });
  }, []);

  return component;
};

LazyComponent.propTypes = {
  __load: PropTypes.func.isRequired,
  __options: PropTypes.object.isRequired
};

export default (load, opts = {}) => props =>
  <LazyComponent {...props} __load={load} __options={opts} />;
