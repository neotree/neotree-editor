/* global window */
import React from 'react';
import useClipboardReducer from 'AppHooks/clipboardReducer';
import useAppReducer from 'AppHooks/appReducer';
import Snackbar from 'ui/Snackbar';
import { Button } from 'react-mdl';
import { MdClose } from 'react-icons/md';
import { withRouter } from 'react-router-dom';
import Api from 'AppUtils/Api';

export default (accept = []) => Component => withRouter(props => {
  const { match } = props;

  const [{ data }, dispatchClipboardActions, clipboardActions] = useClipboardReducer();

  const [{ host }] = useAppReducer();

  const component = <Component {...props} />;

  if (!accept || (accept && !accept.map)) return component;

  const copiedData = data ? data[Object.keys(data)[0]] : null;

  return (
    <>
      {!copiedData ? null :
        <Snackbar>
          <div className="ui__flex ui__alignItems_center">
            <span>{Object.keys(data)[0]} copied ({copiedData.ids.length})</span>&nbsp;
            <Button
              disabled={!accept.includes(Object.keys(data)[0])}
              onClick={() => {
                let d = {};
                if (match.params.scriptId) {
                  d = { dataId: match.params.scriptId, dataType: 'script' };
                }
                Api.post('/copy-data', {
                  destination: { ...d, host },
                  source: { host, ids: copiedData.ids, dataType: Object.keys(data)[0] },
                }).then(() => {
                  window.location.reload();
                })
                  .catch(console.log); // eslint-disable-line
              }}
            >Paste</Button>&nbsp;&nbsp;
            <div
              className="ui__cursor_pointer ui__flex ui__alignItems_center"
              onClick={() => {
                dispatchClipboardActions(clipboardActions.updateState({
                  data: null
                }));
              }}
            ><MdClose /></div>
          </div>
        </Snackbar>}

      {component}
    </>
  );
});
