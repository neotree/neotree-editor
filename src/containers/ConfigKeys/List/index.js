import React from 'react';
import copy from '@/constants/copy/configKeys';
import { setHeaderTitle } from '@/components/Layout';
import { setDocumentTitle } from '@/contexts/app';
import { provideConfigKeysContext, useConfigKeysContext } from '@/contexts/config-keys';
import PageLoader from '@/components/PageLoader';
import DataTable from '@/components/DataTable';
import OverlayLoader from '@/components/OverlayLoader';

const ConfigKeysList = () => {
  setDocumentTitle(copy.PAGE_TITLE);
  setHeaderTitle(copy.PAGE_TITLE);

  const {
    updateConfigKeys,
    setState,
    state: {
      configKeys,
      configKeysInitialised,
      loadingConfigKeys,
      duplicatingConfigKeys,
      deletingConfigKeys,
    }
  } = useConfigKeysContext();

  return (
    <>
      {!configKeysInitialised ? null : (
        <>
          <DataTable
            noDataMsg="No config keys"
            selectable={false}
            title={copy.PAGE_TITLE}
            data={configKeys}
            renderHeaderActions={require('./_renderHeaderActions').default}
            renderRowAction={require('./_renderRowAction').default}
            displayFields={[
              { key: 'configKey', label: 'Key', },
              { key: 'label', label: 'Label', },
              { key: 'summary', label: 'Summary', },
            ]}
            onSortData={configKeys => {
              setState({ configKeys });
              updateConfigKeys(configKeys.map(s => ({
                configKeyId: s.configKeyId,
                position: s.position
              })));
            }}
          />
        </>
      )}

      {loadingConfigKeys && <PageLoader />}
      {(deletingConfigKeys || duplicatingConfigKeys) ? <OverlayLoader /> : null}
    </>
  );
};

export default provideConfigKeysContext(ConfigKeysList);
