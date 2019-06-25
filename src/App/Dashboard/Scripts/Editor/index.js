import React from 'react';
import PropTypes from 'prop-types';
import { hot } from 'react-hot-loader/root';
import { withRouter } from 'react-router-dom';
import reduxComponent from 'reduxComponent'; // eslint-disable-line
import Editor from './Editor';

export class ScriptEditor extends React.Component {
  render() {
    return <Editor {...this.props} />;
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
    isEditMode: ownProps.match.params.scriptId !== 'new'
  }))
));
