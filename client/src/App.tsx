import * as React from 'react';
import './App.css';
import { LayoutFrame } from './components/LayoutFrame/index'
export class App extends React.Component<any, any> {
	public render() {
		return (
			<div>
				<LayoutFrame  />
			</div>
		);
	}
}
