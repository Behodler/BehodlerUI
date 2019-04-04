import { AppPresentationComponent } from '../App'

import { connect } from 'react-redux'

import * as layoutFrame from '../components/LayoutFrame/container'
import { bindActionCreators } from 'redux';
import sections from '../redux/sections'
import { withRouter } from 'react-router';

function mapStateToProps(state: any): any {
	let props = {}
	props[sections.walletSection] = layoutFrame.mapStateToProps(state[sections.walletSection])
	return props
}

const mapDispatchToProps = (dispatch: any, ownProps: any) => bindActionCreators(
	{
		...layoutFrame.mapDispatchToProps(dispatch, ownProps)
	}
	, dispatch);

export default withRouter<any>(connect(mapStateToProps, mapDispatchToProps)(AppPresentationComponent))