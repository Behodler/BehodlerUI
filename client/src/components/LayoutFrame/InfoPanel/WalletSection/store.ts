export interface IWalletStore{
	address:string
	friendly:string
	editingFriendly:boolean
	friendlyTextField:string | undefined
	submittingFriendly:boolean
	daiBalance:number
	weiDaiBalance:number
	incubatingWeiDai:number
}

export const initialState:IWalletStore = {
	address:'0x0',
	friendly:'',
	editingFriendly:false,
	friendlyTextField:'',
	daiBalance:0,
	weiDaiBalance:0,
	incubatingWeiDai:0,
	submittingFriendly:false
}