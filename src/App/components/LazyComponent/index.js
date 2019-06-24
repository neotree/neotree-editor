import React, { Component } from 'react';
import PropTypes from 'prop-types';

class LazyComponent extends Component {
  state = {
    component: null,
    error: null,
    loading: false
  };

  componentWillMount() {
    this._isMounted = true;
    this.loadComponent();
  }

  componentWillUnmount() { this._isMounted = false; }

  loadComponent = () => {
    this.setState({ loading: true });
    this.props.load()
      .then(component =>
        this._isMounted &&
          this.setState({ component, loading: false })
      ).catch(error =>
        this._isMounted &&
          this.setState({ error, loading: false }));
  };

  render() {
    const { children, Loader } = this.props;
    const { error, component, loading } = this.state;

    if (loading && Loader) return <Loader />;

    if (error) {
      return <p>{error.msg || error.message || JSON.stringify(error)}</p>;
    }

    const Component = component ? (component.default || component) : null;

    return children(Component);
  }
}

LazyComponent.propTypes = {
  load: PropTypes.func.isRequired,
  children: PropTypes.func.isRequired
};

export default (load, opts = {}) => {
  return props => (
    <LazyComponent load={load} {...opts} {...props}>
      {Component => Component ?
        <Component {...props} /> : null}
    </LazyComponent>
  );
};
