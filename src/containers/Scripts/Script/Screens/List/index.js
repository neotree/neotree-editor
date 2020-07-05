import React from 'react';
import copy from '@/constants/copy/screens';
import { provideScreensContext, useScreensContext } from '@/contexts/screens';
import DataTable from '@/components/DataTable';
import OverlayLoader from '@/components/OverlayLoader';
import CircularProgress from '@material-ui/core/CircularProgress';

const ScreensList = () => {
  const {
    updateScreens,
    setState,
    state: {
      screens,
      screensInitialised,
      loadingScreens,
      duplicatingScreens,
      deletingScreens,
    }
  } = useScreensContext();

  return (
    <>
      {!screensInitialised ? null : (
        <>
          <DataTable
            selectable
            noDataMsg="No screens"
            title={copy.PAGE_TITLE}
            data={screens}
            renderHeaderActions={require('./_renderHeaderActions').default}
            renderRowAction={require('./_renderRowAction').default}
            displayFields={[
              { key: 'epicId', label: 'Epic', },
              { key: 'storyId', label: 'Story', },
              { key: 'refId', label: 'Ref', },
              { key: 'title', label: 'Title', },
            ]}
            onSortData={screens => {
              setState({ screens });
              updateScreens(screens.map(s => ({
                id: s.id,
                position: s.position
              })));
            }}
          />
        </>
      )}

      {loadingScreens && (
        <div style={{ margin: 25, textAlign: 'center' }}>
          <CircularProgress />
        </div>
      )}
      {(deletingScreens || duplicatingScreens) ? <OverlayLoader /> : null}
    </>
  );
};

export default provideScreensContext(ScreensList);
