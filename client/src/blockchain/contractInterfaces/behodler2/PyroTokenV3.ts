import { address, uint } from '../SolidityTypes'
import { ERC20 } from '../ERC20'
export interface PyroTokenV3 extends ERC20 {
    config: () => any
    mint: (recipient:address, amount: uint) => any
    redeem: (recipient:address, amount: uint) => any
    redeemRate: () => any
    burn: (amount: uint) => any
}

/*
Note the return value for config:
    struct Configuration {
        address liquidityReceiver;
        IERC20 baseToken;
        address loanOfficer;
        bool pullPendingFeeRevenue;
    }

    -> (address,address,address,bool)
*/