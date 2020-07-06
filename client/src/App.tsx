import * as React from 'react';
import './App.css';
import { LayoutFrame } from './components/LayoutFrame/index'
import { createMuiTheme } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/styles';
import { WalletContextProvider } from './components/Contexts/WalletStatusContext'
import {BrowserRouter, withRouter } from 'react-router-dom'
const theme = createMuiTheme({
	palette: {
		type: 'dark'
	},
	typography: {
		//fontFamily: 'Syncopate',
		//fontSize:11
	}
})

export class App extends React.Component<any, any> {
	public render() {
		const RoutedApp = withRouter(() => {
			return (
				<WalletContextProvider>
					<ThemeProvider theme={theme}>
						<div>
							<LayoutFrame />
						</div>
					</ThemeProvider>
				</WalletContextProvider>
			);
		})
		return <BrowserRouter> <RoutedApp /></BrowserRouter>

	}
}
