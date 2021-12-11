import { createStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import userReducer from './userReducer';

/**
 * following: https://dev.to/bhatvikrant/redux-persist-v6-in-detail-react-10nh
 * and: https://github.com/stevens-cs546-cs554/CS-554/tree/master/redux/redux-react-example
 */

const persistConfig = {
	key: 'user',
	storage	// default is localStorage
}

const store = createStore(
	persistReducer(persistConfig, userReducer),
	window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

const persistor = persistStore(store);

export {store, persistor};