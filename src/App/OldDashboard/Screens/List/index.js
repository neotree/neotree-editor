import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { hot } from 'react-hot-loader/root';
import { withRouter } from 'react-router-dom';
import useScreensReducer from 'AppHooks/screensReducer';
import Api from 'AppUtils/Api';
import Spinner from 'ui/Spinner';
import Display from './Display';

const Screens = props => {
  const scriptId = props.match.params.scriptId;

  const [loading, setLoading] = useState(false);

  const [
    loadingError, // eslint-disable-line
    setLoadingError
  ] = useState(null);

  const [
    { screens },
    dispatchScreensActions,
    screensActions
  ] = useScreensReducer();

  useEffect(() => {
    setLoading(true);
    Api.get('/get-screens', { script_id: scriptId })
      .then(r => { setLoading(false); return r; })
      .then(({ payload }) => {
        setLoading(false);
        dispatchScreensActions(screensActions.updateState({ screens: payload.screens || [] }));
      }).catch(loadingError => { setLoading(false); setLoadingError(loadingError); });
  }, []);

  return (
    <div>
      {!screens.length && loading && <Spinner className="ui__flex ui__justifyContent_center" />}
      {!screens.length && loading ? null :
        <Display
          {...props}
          screens={screens.sort((a, b) => a.position - b.position)}
          updateState={state => dispatchScreensActions(screensActions.updateState(state))}
        />}
    </div>
  );
};

Screens.propTypes = {
  match: PropTypes.object
};

export default hot(withRouter(Screens));
