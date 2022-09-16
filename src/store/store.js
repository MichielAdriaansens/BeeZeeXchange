import {createStore, applyMiddleware, combineReducers} from 'redux';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';

//importing reducers
import { provider, tokens, exchange } from './reducers';

const reducer = combineReducers({
    provider,
    tokens,
    exchange
});

const initialState = {};
const middleWare = [thunk];

const store = createStore(reducer,initialState,composeWithDevTools(applyMiddleware(...middleWare)));

export default store;