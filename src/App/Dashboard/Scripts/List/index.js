import React from 'react';
import PropTypes from 'prop-types';
import { hot } from 'react-hot-loader/root';
import { withRouter } from 'react-router-dom';
import reduxComponent from 'reduxComponent'; // eslint-disable-line
import Display from './Display';

export class List extends React.Component {
  state = {};

  componentWillMount() {
    const { actions } = this.props;
    this.setState({ loadingScripts: true });
    actions.post('get-scripts', {
       onResponse: () => this.setState({ loadingScripts: false }),
       onFailure: loadScriptsError => this.setState({ loadScriptsError }),
       onSuccess: ({ payload }) => {
         this.setState({ scripts: payload.scripts });
         actions.updateApiData({ scripts: payload.scripts });
       }
    });
  }

  componentWillUnmount() {
    this.props.actions.updateApiData({ scripts: [] });
  }

  render() {
    return <Display {...this.props} />;
  }
}

List.propTypes = {
  scripts: PropTypes.array
};

export default hot(withRouter(
  reduxComponent(List, state => ({
    scripts: state.apiData.scripts || []
  }))
));
