import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { hot } from 'react-hot-loader/root';
import { withRouter } from 'react-router-dom';
import useConfigKeysReducer from 'AppHooks/configKeysReducer';
import Api from 'AppUtils/Api';
import Spinner from 'AppComponents/Spinner';
import List from './List';

const ConfigKeys = props => {
  const [loading, setLoading] = useState(false);
  const [
    loadingError, 
    setLoadingError
  ] = useState(null);

  const [
    { configKeys },
    dispatchCkActions,
    ckActions
  ] = useConfigKeysReducer();

  useEffect(() => {
    setLoading(true);
    Api.get('/get-config-keys')
      .then(({ payload }) => {
        setLoading(false);
        dispatchCkActions(ckActions.updateState({ configKeys: payload.configKeys || [] }));
      }).catch(loadingError => { setLoading(false); setLoadingError(loadingError); });
  }, []);

  return (
    <div>
      {!configKeys.length && loading && <Spinner className="ui__flex ui__justifyContent_center" />}
      {!configKeys.length && loading ? null :
        <List
          {...props}
          configKeys={configKeys}
          updateState={state => dispatchCkActions(ckActions.updateState(state))}
        />}
    </div>
  );
};

ConfigKeys.propTypes = {
  match: PropTypes.object
};

export default hot(withRouter(ConfigKeys));
