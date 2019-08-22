import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { hot } from 'react-hot-loader/root';
import { withRouter } from 'react-router-dom';
import useDiagnosesReducer from 'AppHooks/diagnosesReducer';
import Api from 'AppUtils/Api';
import Spinner from 'ui/Spinner';
import Display from './Display';

const Diagnoses = props => {
  const scriptId = props.match.params.scriptId;

  const [loading, setLoading] = useState(false);

  const [
    loadingError, // eslint-disable-line
    setLoadingError
  ] = useState(null);

  const [
    { diagnoses },
    dispatchDiagnosesActions,
    diagnosesActions
  ] = useDiagnosesReducer();

  useEffect(() => {
    setLoading(true);
    Api.get('/get-diagnoses', { script_id: scriptId })
      .then(r => { setLoading(false); return r; })
      .then(({ payload }) => {
        setLoading(false);
        dispatchDiagnosesActions(diagnosesActions.updateState({ diagnoses: payload.diagnoses || [] }));
      }).catch(loadingError => { setLoading(false); setLoadingError(loadingError); });
  }, []);

  return (
    <div>
      {!diagnoses.length && loading && <Spinner className="ui__flex ui__justifyContent_center" />}
      {!diagnoses.length && loading ? null :
        <Display
          {...props}
          diagnoses={diagnoses}
          updateState={state => dispatchDiagnosesActions(diagnosesActions.updateState(state))}
        />}
    </div>
  );
};

Diagnoses.propTypes = {
  match: PropTypes.object
};

export default hot(withRouter(Diagnoses));
