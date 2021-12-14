import React from "react";
import Head from 'next/head';
import App from "../src/App";

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "../src/redux/store";

const Index = () => {
  return (
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <Head><title>Jeopardy Trainer</title></Head>
        <App />
      </PersistGate>
    </Provider>
  );
};

export default Index;
