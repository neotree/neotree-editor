import React from 'react';
import PropTypes from 'prop-types';
import { hot } from 'react-hot-loader/root';
import { withRouter } from 'react-router-dom';
import reduxComponent from 'reduxComponent'; // eslint-disable-line
import Spinner from 'ui/Spinner'; // eslint-disable-line
import Display from './Display';

export class ScriptEditor extends React.Component {
  state = {};

  componentWillMount() {
    const { scriptId, actions } = this.props;

    if (scriptId && (scriptId !== 'new')) {
      this.setState({ loadingScript: true });
      actions.get('get-script', {
         id: scriptId,
         onResponse: () => this.setState({ loadingScript: false }),
         onFailure: loadScriptError => this.setState({ loadScriptError }),
         onSuccess: ({ payload }) => {
           this.setState({ script: payload.script });
           actions.updateApiData({ script: payload.script });
         }
      });
    }
  }

  componentWillUnmount() {
    this.props.actions.updateApiData({ script: null });
  }

  render() {
    const { loadingScript } = this.state;

    if (loadingScript) return <Spinner className="ui__flex ui__justifyContent_center" />;

    return <Display {...this.props} />;
  }
}

ScriptEditor.propTypes = {
  actions: PropTypes.object,
  scriptId: PropTypes.string.isRequired,
  isEditMode: PropTypes.bool.isRequired
};

export default hot(withRouter(
  reduxComponent(ScriptEditor, (state, ownProps) => ({
    script: state.apiData.script,
    scriptId: ownProps.match.params.scriptId,
    isEditMode: state.apiData.script ? true : false
  }))
));
