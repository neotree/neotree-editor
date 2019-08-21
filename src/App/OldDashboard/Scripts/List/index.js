import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { hot } from 'react-hot-loader/root';
import { withRouter } from 'react-router-dom';
import useScriptsReducer from 'AppHooks/scriptsReducer';
import Api from 'AppUtils/Api';
import Spinner from 'ui/Spinner';
import Display from './Display';

const Scripts = props => {
  const [loading, setLoading] = useState(false);
  const [
    loadingError, // eslint-disable-line
    setLoadingError
  ] = useState(null);

  const [
    { scripts },
    dispatchScriptsActions,
    scriptsActions
  ] = useScriptsReducer();

  useEffect(() => {
    setLoading(true);
    Api.get('/get-scripts')
      .then(r => { setLoading(false); return r; })
      .then(({ payload }) => {
        setLoading(false);
        dispatchScriptsActions(scriptsActions.updateState({ scripts: payload.scripts || [] }));
      }).catch(loadingError => { setLoading(false); setLoadingError(loadingError); });
  }, []);

  return (
    <div>
      {!scripts.length && loading && <Spinner className="ui__flex ui__justifyContent_center" />}
      {!scripts.length && loading ? null :
        <Display
          {...props}
          scripts={scripts}
          updateState={state => dispatchScriptsActions(scriptsActions.updateState(state))}
        />}
    </div>
  );
};

Scripts.propTypes = {
  match: PropTypes.object
};

export default hot(withRouter(Scripts));
