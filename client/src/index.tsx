import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './containers/App';
import './index.css';
import registerServiceWorker from './registerServiceWorker';
import { Provider } from 'react-redux';
import { store, history } from './redux/store'
import { ConnectedRouter } from 'connected-react-router'
import {} from './util/HTML5'
// import { Route, Switch } from 'react-router'

ReactDOM.render(
	<Provider store={store}>
		<ConnectedRouter history={history}>
				<App />
		</ConnectedRouter>
	</Provider>,
	document.getElementById('root') as HTMLElement
);
registerServiceWorker();
