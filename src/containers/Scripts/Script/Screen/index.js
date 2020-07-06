import React from 'react';
import { provideScreenContext, useScreenContext } from '@/contexts/screen';
import { useScriptContext } from '@/contexts/script';
import screensCopy from '@/constants/copy/screens';
import scritpsCopy from '@/constants/copy/scripts';
import { setHeaderTitle } from '@/components/Layout';
import { setDocumentTitle } from '@/contexts/app';
import OverlayLoader from '@/components/OverlayLoader';
import Form from './Form';

function Screen() {
  const { state: { script } } = useScriptContext();
  const { state: { screen, loadingScreen, savingScreen, } } = useScreenContext();

  const titleChunks = !script ? [] : [
    scritpsCopy.PAGE_TITLE,
    script.data.title,
    screensCopy.PAGE_TITLE,
    screen ? screen.data.title : loadingScreen ? '' : 'New screen',
  ].filter(c => c);

  setDocumentTitle(titleChunks.join(' > '));
  setHeaderTitle(titleChunks.join(' / '));

  if (!script || loadingScreen) return <OverlayLoader transparent />;

  return (
    <>
      <Form />
      {(loadingScreen && savingScreen) ? <OverlayLoader /> : null}
    </>
  );
}

export default provideScreenContext(Screen);
