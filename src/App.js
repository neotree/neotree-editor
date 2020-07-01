import React from 'react';
import { provideAppContext, useAppContext } from '@/contexts/app';
import { LayoutRoot } from '@/components/Layout';
import OverlayLoader from '@/components/OverlayLoader';
import renderDocumentTitle from '@/components/renderDocumentTitle';
import Containers from './containers';

const App = () => {
  const { state: { appInitialised } } = useAppContext();

  const wrapComponents = components => (
    <LayoutRoot>
      {components}
    </LayoutRoot>
  );

  if (!appInitialised) return wrapComponents(<OverlayLoader />);

  return (
    <>
      {renderDocumentTitle()}
      {wrapComponents(<Containers />)}
    </>
  );
};

App.propTypes = {};

export default provideAppContext(App);
