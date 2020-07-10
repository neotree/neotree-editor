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
    socket.on('create_scripts', data => console.log('socket: create_scripts', data)); // eslint-disable-line
    socket.on('update_scripts', data => console.log('socket: update_scripts', data)); // eslint-disable-line
    socket.on('delete_scripts', data => console.log('socket: delete_scripts', data)); // eslint-disable-line

    socket.on('create_screens', data => console.log('socket: create_screens', data)); // eslint-disable-line
    socket.on('update_screens', data => console.log('socket: update_screens', data)); // eslint-disable-line
    socket.on('delete_screens', data => console.log('socket: delete_screens', data)); // eslint-disable-line

    socket.on('create_diagnoses', data => console.log('socket: create_diagnoses', data)); // eslint-disable-line
    socket.on('update_diagnoses', data => console.log('socket: update_diagnoses', data)); // eslint-disable-line
    socket.on('delete_diagnoses', data => console.log('socket: delete_diagnoses', data)); // eslint-disable-line

    socket.on('create_config_keys', data => console.log('socket: create_config_keys', data)); // eslint-disable-line
    socket.on('update_config_keys', data => console.log('socket: update_config_keys', data)); // eslint-disable-line
    socket.on('delete_config_keys', data => console.log('socket: delete_config_keys', data)); // eslint-disable-line
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
