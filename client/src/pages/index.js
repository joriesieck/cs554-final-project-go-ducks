import React from 'react';
import _app from './_app';
import App from '../App';
<<<<<<< HEAD
import { persistor, store } from '../redux/store';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

const Index = () => {
  return (
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  );
=======
import AuthContainer from '../AuthContainer';

const Index = () => {
  return <App />;
>>>>>>> main
};

export default Index;
