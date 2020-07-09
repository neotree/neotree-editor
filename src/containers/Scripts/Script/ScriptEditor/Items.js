import React from 'react';
import { useScriptContext } from '@/contexts/script';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import CircularProgress from '@material-ui/core/CircularProgress';
import { useHistory } from 'react-router-dom';
import LazyComponent from '@/components/LazyComponent';

const LoaderComponent = () => (
  <div style={{ margin: 25, textAlign: 'center' }}>
    <CircularProgress />
  </div>
);

const Screens = LazyComponent(() => import('../Screens/List'), { LoaderComponent });
const Diagnoses = LazyComponent(() => import('../Diagnoses/List'), { LoaderComponent });

function ScriptEditor() {
  const history = useHistory();
  const { setState, state: { scriptSection, script } } = useScriptContext();

  return (
    <>
      {!script ? null : (
        <>
          <Tabs
            centered
            value={scriptSection}
            indicatorColor="primary"
            textColor="primary"
            onChange={(e, scriptSection) => {
              setState({ scriptSection });
              history.push(`/scripts/${script.id}/${scriptSection}`);
            }}
          >
            <Tab value="screens" label="Screens" />
            <Tab value="diagnoses" label="Diagnoses" />
          </Tabs>

          {scriptSection === 'screens' && <Screens />}
          {scriptSection === 'diagnoses' && <Diagnoses />}
        </>
      )}
    </>
  );
}

export default ScriptEditor;
