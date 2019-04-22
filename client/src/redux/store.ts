import { walletReducer } from '../components/LayoutFrame/InfoPanel/WalletSection/reducers'
import { layoutReducer } from '../components/LayoutFrame/reducers'
import sections from './sections'
import { createBrowserHistory } from 'history';
import createSagaMiddleware from 'redux-saga';
import { createStore, combineReducers, compose, applyMiddleware } from 'redux';
import { connectRouter, routerMiddleware } from 'connected-react-router';
import { walletRoot } from '../components/LayoutFrame/InfoPanel//WalletSection/sagas'
import { layoutRoot } from '../components/LayoutFrame/sagas'

const sagaMiddleware = createSagaMiddleware();
const key = "__REDUX_DEVTOOLS_EXTENSION_COMPOSE__"
const composeEnhancers = compose || window[key];
export const history = createBrowserHistory();
const walletSection: string = sections.walletSection
const layoutSection: string = sections.layoutSection

const rootReducerFactory = (history: any) => combineReducers({
	router: connectRouter(history),
	[layoutSection]: layoutReducer,
	[walletSection]: walletReducer
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

sagaMiddleware.run(walletRoot)
sagaMiddleware.run(layoutRoot)
