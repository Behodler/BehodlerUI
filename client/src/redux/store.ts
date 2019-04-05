import { walletReducer } from '../components/LayoutFrame/InfoPanel/WalletSection/reducers'
import { createBrowserHistory } from 'history';
import createSagaMiddleware from 'redux-saga';
import { createStore, combineReducers, compose, applyMiddleware } from 'redux';
import { connectRouter, routerMiddleware } from 'connected-react-router';
import { walletRoot } from '../components/LayoutFrame/InfoPanel//WalletSection/sagas'

const sagaMiddleware = createSagaMiddleware();
const key = "__REDUX_DEVTOOLS_EXTENSION_COMPOSE__"
const composeEnhancers = window[key] || compose;
export const history = createBrowserHistory();

const rootReducerFactory = (history: any) => combineReducers({
	router: connectRouter(history),
	"walletSection": walletReducer
})

export const store = createStore(
	rootReducerFactory(history),
	composeEnhancers(
		applyMiddleware(
			routerMiddleware(history),
			sagaMiddleware
		),
	),
)

sagaMiddleware.run(walletRoot);
