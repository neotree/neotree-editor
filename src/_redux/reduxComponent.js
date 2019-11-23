import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from 'actions'; 

const mapStateToProps = stateToPropsMapper => (state, ownProps) =>
  stateToPropsMapper ? stateToPropsMapper(state, ownProps) : {};

const mapDispatchToProps = dispatch =>
  ({ actions: bindActionCreators(actions, dispatch) });

export default (Component, stateToPropsMapper) => connect(
  mapStateToProps(stateToPropsMapper),
  mapDispatchToProps
)(Component);
