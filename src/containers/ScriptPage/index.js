/* global fetch, alert */
import React from 'react';
import { useParams, useHistory } from 'react-router-dom';
import CircularProgress from '@material-ui/core/CircularProgress';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import OverlayLoader from '@/components/OverlayLoader';
import LazyComponent from '@/components/LazyComponent';
import * as api from '@/api/hospitals';
import Form from './Form';

const LoaderComponent = () => (
  <div style={{ margin: 25, textAlign: 'center' }}>
    <CircularProgress />
  </div>
);

const Screens = LazyComponent(() => import('./Screens'), { LoaderComponent });
const Diagnoses = LazyComponent(() => import('./Diagnoses'), { LoaderComponent });

function ScriptPage() {
  const history = useHistory();
  const { scriptId, scriptSection: _scriptSection } = useParams();

  const [hospitals, setHospitals] = React.useState([]);
  const [script, setScript] = React.useState(null);
  const [scriptInitialised, setScriptInitialised] = React.useState(false);
  const [loadingScript, setLoadingScript] = React.useState(false);

  const [scriptSection, setScriptSection] = React.useState(_scriptSection || 'screens');

  React.useEffect(() => {
    (async () => {
      setLoadingScript(true);
      try {
        const { hospitals } = await api.getHospitals();
		setHospitals(hospitals || []);

        if (scriptId !== 'new') {
            const res = await fetch(`/get-script?scriptId=${scriptId}`);
            const { script } = await res.json();
            setScript(script);
        }
      } catch(e) {
        //
      } finally {
        setScriptInitialised(true);
        setLoadingScript(false);
      }
    })();
  }, []);

  if (!scriptInitialised) return <OverlayLoader />;

  return (
    <>
      <Form script={script} hospitals={hospitals} />

      <br />

      {!script ? null : (
        <>
          <Tabs
            centered
            value={scriptSection}
            indicatorColor="primary"
            textColor="primary"
            onChange={(e, scriptSection) => {
              setScriptSection(scriptSection);
              history.push(`/scripts/${script.scriptId}/${scriptSection}`);
            }}
          >
            <Tab value="screens" label="Screens" />
            <Tab value="diagnoses" label="Diagnoses" />
          </Tabs>

          {scriptSection === 'screens' && <Screens script={script} />}
          {scriptSection === 'diagnoses' && <Diagnoses script={script} />}
        </>
      )}

      {loadingScript && <OverlayLoader />}
    </>
  );
}

export default ScriptPage;
