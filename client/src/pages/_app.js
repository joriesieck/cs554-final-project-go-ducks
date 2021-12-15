import './global.css';
import App from '../App';
import AuthContainer from '../AuthContainer';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '../redux/store';
import { BrowserRouter as Router } from 'react-router-dom';
import NavBar from '../components/Nav/Nav';

export default function _app({ Component, pageProps }) {
  return (
    <div>
      {typeof window === 'undefined' ? null : (
        <Router>
          <Provider store={store}>
            <PersistGate persistor={persistor}>
              <Component {...pageProps} />
            </PersistGate>
          </Provider>
        </Router>
      )}
    </div>
  );
}
