import React from 'react';
import { provideAppContext, useAppContext } from '@/contexts/app';
import { LayoutRoot } from '@/components/Layout';
import PageLoader from '@/components/PageLoader';
import DocumentTitle from '@/components/DocumentTitle';
import io from 'socket.io-client';
import Containers from './containers';

const socket = io();

const App = () => {
  const { state: { appInitialised } } = useAppContext();

  const wrapComponents = components => (
    <LayoutRoot>
      {components}
    </LayoutRoot>
  );

  React.useEffect(() => {
    socket.on('data_updated', data => console.log('socket: data_updated', data)); // eslint-disable-line
  }, []);

  if (!appInitialised) return wrapComponents(<PageLoader />);

  return (
    <>
      <DocumentTitle />
      {wrapComponents(<Containers />)}
    </>
  );
};

App.propTypes = {};

export default provideAppContext(App);
