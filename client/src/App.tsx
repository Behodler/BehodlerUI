import * as React from 'react';
import './App.css';
import { LayoutFrame } from './components/LayoutFrame/index'
import { createMuiTheme } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/styles';
const theme = createMuiTheme({
	palette:{
		type:'dark'
	},
	typography: {
		//fontFamily: 'Syncopate',
		//fontSize:11
	}
})

export class App extends React.Component<any, any> {
	public render() {
		return (
			<ThemeProvider theme={theme}>
				<div>
					<LayoutFrame/>
				</div>
			</ThemeProvider>
		);
	}
}
