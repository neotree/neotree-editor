/* global fetch, alert */
import React from 'react';
import { setNavSection, setDocumentTitle } from '@/AppContext';
import copy from '@/constants/copy/configKeys';
import PageLoader from '@/components/PageLoader';
import DataTable from '@/components/DataTable';

const ConfigKeys = () => {
  setNavSection('configKeys');
  setDocumentTitle(copy.PAGE_TITLE);

  const [configKeys, setConfigKeys] = React.useState([]);
  const [configKeysInitialised, setConfigKeysInitialised] = React.useState(false);
  const [loadingConfigKeys, setLoadingConfigKeys] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      setLoadingConfigKeys(true);
      try {
        const res = await fetch('/get-config-keys');
        const { configKeys } = await res.json();
        setConfigKeys(configKeys);
      } catch (e) { alert(e.message); }
      setConfigKeysInitialised(true);
      setLoadingConfigKeys(false);
    })();
  }, []);

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
              setConfigKeys(configKeys);
              (async () => {
                try {
                  const res = await fetch('/update-config-keys', {
                    headers: { 'Content-Type': 'application/json' },
                    method: 'POST',
                    body: JSON.stringify({ configKeys: configKeys.map(s => ({ id: s.id, position: s.position })) }),
                  });
                  await res.json();
                } catch (e) { /* Do nothing */ }
              })();
            }}
          />
        </>
      )}

      {loadingConfigKeys && <PageLoader />}
    </>
  );
};

export default ConfigKeys;
