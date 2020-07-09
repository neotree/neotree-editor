import React from 'react';
import ApiKey from './ApiKey';
import ExportToFirebase from './ExportToFirebase';
import ImportFromFirebase from './ImportFromFirebase';

const IndexPage = () => {
  return (
    <>
      <ExportToFirebase />

      <br />

      <ImportFromFirebase />

      <br /> <br />

      <ApiKey />
    </>
  );
};

export default IndexPage;
