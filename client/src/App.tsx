import * as React from 'react';
import './App.css';
import { LayoutFrame, populateLayoutFrameProps } from './components/LayoutFrame/index'
class AppPresentationComponent extends React.Component<any, any> {
	public render() {
		return (
			<div>
				<LayoutFrame {...populateLayoutFrameProps(this.props)} />
			</div>
		);
	}
}



export { AppPresentationComponent };
