/* global fetch, alert */
import React from 'react';
import { Redirect, useParams } from 'react-router-dom';
import screensCopy from '@/constants/copy/screens';
import scritpsCopy from '@/constants/copy/scripts';
import { setDocumentTitle, useAppContext } from '@/AppContext';
import OverlayLoader from '@/components/OverlayLoader';
import Form from './Form';

function Screen() {
  const { state: { viewMode } } = useAppContext();
  if (viewMode === 'view') return <Redirect to="/" />;

  const { scriptId, screenId } = useParams();
  const [screen, setScreen] = React.useState(null);
  const [script, setScript] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/get-script?scriptId=${scriptId}`);
        const { script } = await res.json();
        setScript(script);
      } catch (e) { /* DO NOTHING */ }

      if (screenId !== 'new') {
        try {
          const res = await fetch(`/get-screen?id=${screenId}`);
          const { screen } = await res.json();
          setScreen(screen);
        } catch (e) { alert(e.message); }
      }

      setLoading(false);
    })();
  }, []);

  const titleChunks = !script ? [] : [
    scritpsCopy.PAGE_TITLE,
    script.title,
    screensCopy.PAGE_TITLE,
    screen ? screen.title : loading ? '' : 'New screen',
  ].filter(c => c);

  setDocumentTitle(titleChunks.join(' > '));

  if (loading) return <OverlayLoader transparent />;

  return (
    <>
      <Form
        script={script}
        screen={screen}
      />
    </>
  );
}

export default Screen;
