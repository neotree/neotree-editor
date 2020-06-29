import React from 'react';
import ApiKey from './ApiKey';
import ExportToFirebase from './ExportToFirebase';

const IndexPage = () => {
  return (
    <>
      <ExportToFirebase />

      <br />

      <ApiKey />
    </>
  );
};

export default IndexPage;
