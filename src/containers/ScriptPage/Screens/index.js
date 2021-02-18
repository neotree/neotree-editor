/* global fetch, alert */
import React from 'react';
import { useParams } from 'react-router-dom';
import copy from '@/constants/copy/screens';
import DataTable from '@/components/DataTable';
import CircularProgress from '@material-ui/core/CircularProgress';
import { useAppContext } from '@/AppContext';

const ScreensList = () => {
  const { state: { viewMode } } = useAppContext();
  const { scriptId } = useParams();

  const [screens, setScreens] = React.useState([]);
  const [screensInitialised, setScreensInitialised] = React.useState(false);
  const [loadingScreens, setLoadingScreens] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      setLoadingScreens(true);
      try {
        const res = await fetch(`/get-screens?scriptId=${scriptId}`);
        const { screens } = await res.json();
        setScreens(screens);
      } catch (e) { alert(e.message); }
      setScreensInitialised(true);
      setLoadingScreens(false);
    })();
  }, []);

  return (
    <>
      {!screensInitialised ? null : (
        <>
          <DataTable
            selectable={viewMode !== 'view'}
            noDataMsg="No screens"
            title={copy.PAGE_TITLE}
            data={screens}
            renderHeaderActions={viewMode === 'view' ? null : require('./_renderHeaderActions').default}
            renderRowAction={require('./_renderRowAction').default}
            displayFields={[
              { key: 'position', label: 'Position', render: ({ row }) => row.position, },
              { key: 'type', label: 'Type', },
              { key: 'epicId', label: 'Epic', },
              { key: 'storyId', label: 'Story', },
              { key: 'refId', label: 'Ref', },
              { key: 'title', label: 'Title', },
            ]}
            onSortData={viewMode === 'view' ? undefined : screens => {
              setScreens(screens);
              (async () => {
                try {
                  const res = await fetch('/update-screens', {
                    headers: { 'Content-Type': 'application/json' },
                    method: 'POST',
                    body: JSON.stringify({ screens: screens.map(s => ({ id: s.id, position: s.position })) }),
                  });
                  await res.json();
                } catch (e) { /* Do nothing */ }
              })();
            }}
          />
        </>
      )}

      {loadingScreens && (
        <div style={{ margin: 25, textAlign: 'center' }}>
          <CircularProgress />
        </div>
      )}
    </>
  );
};

export default ScreensList;
