export interface IWalletStore{
	address:string
	friendly:string
	editingFriendly:boolean
	friendlyTextField:string | undefined
	submittingFriendly:boolean
	daiBalance:number
	weiDaiBalance:number
	incubatingWeiDai:number
	hovering:boolean
}

export const initialState:IWalletStore = {
	address:'0x0',
	friendly:'',
	editingFriendly:true,
	friendlyTextField:'',
	daiBalance:0,
	weiDaiBalance:0,
	incubatingWeiDai:0,
	submittingFriendly:false,
	hovering:false
}