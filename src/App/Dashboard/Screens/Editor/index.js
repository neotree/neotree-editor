import React from 'react';
import PropTypes from 'prop-types';
import { hot } from 'react-hot-loader/root';
import { withRouter } from 'react-router-dom';
import reduxComponent from 'reduxComponent'; // eslint-disable-line
import Display from './Display';
import Spinner from 'ui/Spinner'; // eslint-disable-line

export class ScreenEditor extends React.Component {
  state = {};

  componentWillMount() {
    const { screenId, actions } = this.props;
    if (screenId && (screenId !== 'new')) {
      this.setState({ loadingScreen: true });
      actions.get('get-screen', {
         id: screenId,
         onResponse: () => this.setState({ loadingScreen: false }),
         onFailure: loadScreenError => this.setState({ loadScreenError }),
         onSuccess: ({ payload }) => {
           this.setState({ screen: payload.screen });
           actions.updateApiData({ screen: payload.screen });
         }
      });
    }
  }

  componentWillUnmount() {
    this.props.actions.updateApiData({ screen: null });
  }

  render() {
    const { loadingScreens } = this.state;

    if (loadingScreens) return <Spinner className="ui__flex ui__justifyContent_center" />;

    return <Display {...this.props} />;
  }
}

ScreenEditor.propTypes = {
  actions: PropTypes.object,
  screenId: PropTypes.string.isRequired,
  isEditMode: PropTypes.bool.isRequired
};

export default hot(withRouter(
  reduxComponent(ScreenEditor, (state, ownProps) => ({
    screen: state.apiData.screen,
    screenId: ownProps.match.params.screenId,
    scriptId: ownProps.match.params.scriptId,
    isEditMode: state.apiData.screen ? true : false
  }))
));
