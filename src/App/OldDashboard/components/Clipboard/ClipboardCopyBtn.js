import React from 'react';
import PropTypes from 'prop-types';
import useClipboardReducer from 'AppHooks/clipboardReducer';
import reduxComponent from 'reduxComponent';

const ClipboardCopyBtn = ({
  container,
  data,
  children,
  host,
  actions, // eslint-disable-line
  ...props
}) => {
  const [clipboard, dispatchClipboardActions, clipboardActions] = useClipboardReducer();
  const Container = container || React.Fragment;

  return (
    <Container>
      <div
        {...props}
        onClick={e => {
          const copiedData = (clipboard.data ? clipboard.data[data.dataType] : null) || { host, ids: [] };
          const ids = (() => {
            const dataIds = data.dataId ? (data.dataId.map ? data.dataId : [data.dataId]) : [];
            let copiedDataIds = copiedData.ids;
            dataIds.forEach(dataId => {
              copiedDataIds = copiedDataIds.includes(dataId) ?
                copiedDataIds.filter(id => id !== dataId)
                :
                [...copiedDataIds, dataId];
            });
            return copiedDataIds;
          })();

          dispatchClipboardActions(clipboardActions.updateState({
            data: ids.length ? { [data.dataType]: { ...copiedData, ids } } : null
          }));
          if (props.onClick) props.onClick(e);
        }}
      >{children}</div>
    </Container>
  );
};

ClipboardCopyBtn.propTypes = {
  children: PropTypes.node,
  data: PropTypes.object.isRequired,
  onClick: PropTypes.func
};

export default reduxComponent(ClipboardCopyBtn, state => ({
  host: state.$APP.host
}));
