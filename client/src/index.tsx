import * as React from 'react'
import * as ReactDOM from 'react-dom'
import './index.css'
import App from './App'

const rootEl = document.getElementById('root')

const render = (Component) => {
    return ReactDOM.render(<Component />, rootEl)
}

render(App)

if (module.hot) {
    module.hot.accept('./App', () => {
        const App = require('./App').default
        render(App)
    })
}
