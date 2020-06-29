import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import useDiagnosesReducer from 'AppHooks/diagnosesReducer';
import useScreenReducer from 'AppHooks/screensReducer';
import useScriptsReducer from 'AppHooks/scriptsReducer';
import Spinner from 'AppComponents/Spinner';
import Api from 'AppUtils/Api';
import Display from './Display';

const ScriptEditor = props => {
  const scriptId = props.match.params.scriptId;

  const [loading, setLoading] = useState(false);

  const [
    loadingError, 
    setLoadingError
  ] = useState(null);

  const [
    { script },
    dispatchScriptsActions,
    scriptsActions
  ] = useScriptsReducer();

  const updateScriptsState = state =>
    dispatchScriptsActions(scriptsActions.updateState(state));

  const [
    screensState, 
    dispatchScreensActions,
    screensActions
  ] = useScreenReducer();

  const [
    diagnosesState, 
    dispatchDiagnosesActions,
    diagnosesActions
  ] = useDiagnosesReducer();

  useEffect(() => {
    dispatchDiagnosesActions(diagnosesActions.updateState({ diagnoses: [] }));
    dispatchScreensActions(screensActions.updateState({ screens: [] }));

    if (scriptId && (scriptId !== 'new')) {
      setLoading(true);
      Api.get('/get-script', { id: scriptId })
        .then(r => { setLoading(false); return r; })
        .then(({ payload }) => {
          setLoading(false);
          updateScriptsState({ script: payload.script || null });
        }).catch(loadingError => { setLoading(false); setLoadingError(loadingError); });
    }

    return () => { updateScriptsState({ script: null }); };
  }, []);

  if (loading) return <Spinner className="ui__flex ui__justifyContent_center" />;

  return (
    <Display
      {...props}
      script={script}
      isEditMode={script ? true : false}
      scriptId={scriptId}
      updateState={updateScriptsState}
    />
  );
};

ScriptEditor.propTypes = {
  match: PropTypes.object.isRequired
};

export default withRouter(ScriptEditor);
