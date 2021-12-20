import { createStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import { composeWithDevTools } from 'redux-devtools-extension';
import storage from 'redux-persist/lib/storage';
import rootReducer from './rootReducer';

/**
 * following: https://dev.to/bhatvikrant/redux-persist-v6-in-detail-react-10nh
 * and: https://github.com/stevens-cs546-cs554/CS-554/tree/master/redux/redux-react-example
 */

const persistConfig = {
  key: 'root',
  storage, // default is localStorage
};

const store = createStore(
  persistReducer(persistConfig, rootReducer),
  composeWithDevTools()
);

const persistor = persistStore(store);

export { store, persistor };
