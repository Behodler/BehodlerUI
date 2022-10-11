import * as React from 'react'
import { Account, Address, BN } from 'ethereumjs-util'
import VM from '@ethereumjs/vm'
import { useState, useEffect, useCallback } from 'react'
import { defaultAbiCoder as AbiCoder, Interface } from '@ethersproject/abi'
import { Transaction } from '@ethereumjs/tx'
// import { readFileSync } from 'fs'
// import { join } from 'path'
// import solc from 'solc'
/* eslint-disable no-restricted-globals */
// import * as wrapper from 'solc/wrapper';
// const solc = wrapper((Window as any).Module)
// // const solc = require('solc')
// import { CompileFailedError, CompileResult, compileSol } from "solc-typed-ast";

export interface StatelessBehodlerContextProps {
    addLiquidity: (amount: string, reserve: string, fee: number) => Promise<string[]>
    withdrawLiquidity: (tokensToRelease: string, reserve: string, scxBalance: string) => Promise<string[]>
    withdrawLiquidityFindSCX: (reserve: string, tokensToRelease: string, scx: string, passes: number) => Promise<string>
    swap: (inputAmount: string, outputAmount: string, initialInputBalance: string, initialOutputBalance: string, fee: number) => Promise<string[]>
}

const defaultContextProps: StatelessBehodlerContextProps = {
    addLiquidity: async (amount: string, reserve: string, fee: number) => {
        return ["0", ""]
    },
    withdrawLiquidity: async (tokensToRelease: string, reserve: string, scxBalance: string) => {
        return ["0", ""]
    },
    withdrawLiquidityFindSCX: async (reserve: string, tokensToRelease: string, scx: string, passes: number) => {
        return "0"
    }
    ,
    swap: async (inputAmount: string, outputAmount: string, initialInputBalance: string, initialOutputBalance: string, fee: number) => {
        return ["0", ""]
    }
}

const StatelessBehodlerContext = React.createContext<StatelessBehodlerContextProps>(defaultContextProps)

function StatelessBehodlerContextProvider(props: any) {
    const accountPk = Buffer.from(
        'e331b6d69882b4cb4ea581d88e0b604039a3de5967688d3dcffdd2270c0fd109',
        'hex',
    )
    const [accountAddress, setAccountAddress] = useState<Address>(Address.fromPrivateKey(accountPk))
    const [EVM, setEVM] = useState<VM>(new VM())
    const [contractAddress, setContractAddress] = useState<Address>()
    const [contextProps, setContextProps] = useState<StatelessBehodlerContextProps>(defaultContextProps)

    const initializeVMCallback = useCallback(async () => {
        setAccountAddress(Address.fromPrivateKey(accountPk))
        const acctData = {
            nonce: 0,
            balance: new BN(10).pow(new BN(18)), // 1 eth
        }
        const account = Account.fromAccountData(acctData)

        const vm = new VM()
        await vm.stateManager.putAccount(accountAddress, account)
        setEVM(vm)
        //  const solcOutput = compileContracts()
        // if (solcOutput === undefined) {
        //     console.log('Compilation failed')
        // } else {
        //     console.log('Compiled the contract')
        // }

        const byteCode = Buffer.from('608060405234801561001057600080fd5b50601e6000800160006101000a81548160ff021916908360ff160217905550605a6000800160016101000a81548160ff021916908360ff160217905550610e8c8061005c6000396000f3fe608060405234801561001057600080fd5b506004361061007d5760003560e01c80637b12a62c1161005b5780637b12a62c146101a0578063894059c6146101c1578063c45c5c3014610283578063e792842b1461035b5761007d565b806321b77d6314610082578063422f1043146100a0578063572861bc14610162575b600080fd5b61008a6103bb565b6040518082815260200191505060405180910390f35b6100e0600480360360608110156100b657600080fd5b810190808035906020019092919080359060200190929190803590602001909291905050506103c4565b6040518083815260200180602001828103825283818151815260200191508051906020019080838360005b8381101561012657808201518184015260208101905061010b565b50505050905090810190601f1680156101535780820380516001836020036101000a031916815260200191505b50935050505060405180910390f35b61019e6004803603604081101561017857600080fd5b81019080803560ff169060200190929190803560ff1690602001909291905050506104e0565b005b6101a861051e565b604051808260ff16815260200191505060405180910390f35b610201600480360360608110156101d757600080fd5b81019080803590602001909291908035906020019092919080359060200190929190505050610537565b6040518083815260200180602001828103825283818151815260200191508051906020019080838360005b8381101561024757808201518184015260208101905061022c565b50505050905090810190601f1680156102745780820380516001836020036101000a031916815260200191505b50935050505060405180910390f35b6102d7600480360360a081101561029957600080fd5b81019080803590602001909291908035906020019092919080359060200190929190803590602001909291908035906020019092919050505061069b565b60405180831515815260200180602001828103825283818151815260200191508051906020019080838360005b8381101561031f578082015181840152602081019050610304565b50505050905090810190601f16801561034c5780820380516001836020036101000a031916815260200191505b50935050505060405180910390f35b6103a56004803603608081101561037157600080fd5b8101908080359060200190929190803590602001909291908035906020019092919080359060200190929190505050610896565b6040518082815260200191505060405180910390f35b64e8d4a5100081565b6000606060006103e164e8d4a5100086816103db57fe5b04610975565b600f0b9050600061042361041e64e8d4a510006104106104018b8a610998565b8b6109c990919063ffffffff16565b610a1390919063ffffffff16565b610975565b600f0b9050600061043d8284610a5d90919063ffffffff16565b9050600064e8d4a510008210159050806104965760006040518060400160405280601881526020017f4245484f444c45523a206d696e206c69717569646974792e000000000000000081525095509550505050506104d8565b6000600185116104a75760006104b1565b6104b085610ae5565b5b6104ba84610ae5565b03905080604051806020016040528060008152509650965050505050505b935093915050565b816000800160006101000a81548160ff021916908360ff160217905550806000800160016101000a81548160ff021916908360ff1602179055505050565b60008060000160019054906101000a900460ff16905090565b600060606000849050600061055587836109c990919063ffffffff16565b9050600064e8d4a5100082119050806105ac5760006040518060400160405280601781526020017f4245484f444c45523a206d696e206c697175696469747900000000000000000081525094509450505050610693565b60008060000160019054906101000a900460ff1660ff166105e9856105db60648d610c0090919063ffffffff16565b610a1390919063ffffffff16565b111590508061061a576000604051806060016040528060298152602001610e2e602991399550955050505050610693565b600061062585610ae5565b9050600061063285610ae5565b9050600060018611610645576000610647565b815b83039050898111156106765760008a8203905060008261271083028161066957fe5b041415610674578a91505b505b806040518060200160405280600081525098509850505050505050505b935093915050565b6000606060006106bd6106ae8986610998565b896109c990919063ffffffff16565b905060008060000160019054906101000a900460ff1660ff166106fc876106ee60648c610c0090919063ffffffff16565b610a1390919063ffffffff16565b111590508061072b576000604051806060016040528060298152602001610e2e6029913993509350505061088c565b60006107408389610a5d90919063ffffffff16565b905060006107578a896109c990919063ffffffff16565b90506000610785836000800160009054906101000a900460ff1660ff168c901b610a1390919063ffffffff16565b905060006107b38a6000800160009054906101000a900460ff1660ff1685901b610a1390919063ffffffff16565b905060008083141580156107c657508183145b9050806108155760006040518060400160405280601981526020017f4245484f444c45523a207377617020696e76617269616e742e00000000000000815250985098505050505050505061088c565b505050600064e8d4a510008210159050806108705760006040518060400160405280601881526020017f4245484f444c45523a206d696e206c69717569646974792e000000000000000081525096509650505050505061088c565b6001604051806020016040528060008152509650965050505050505b9550959350505050565b6000808590506000805b8481101561096657600088905060006108c289836109c990919063ffffffff16565b905060006108cf83610ae5565b905060006108dc83610ae5565b90506000600184116108ef5760006108f1565b815b830390506000818c0390506000811415610916578c995050505050505050505061096d565b600081121561092a5760018d039850610931565b60018d0197505b876002898b038161093e57fe5b04019c50858d1161094f578c610951565b855b9c5050505050505080806001019150506108a0565b5085925050505b949350505050565b6000677fffffffffffffff82111561098c57600080fd5b604082901b9050919050565b60006109c16103e86109b38585610c0090919063ffffffff16565b610a1390919063ffffffff16565b905092915050565b6000610a0b83836040518060400160405280601e81526020017f536166654d6174683a207375627472616374696f6e206f766572666c6f770000815250610c86565b905092915050565b6000610a5583836040518060400160405280601a81526020017f536166654d6174683a206469766973696f6e206279207a65726f000000000000815250610d46565b905092915050565b600080828401905083811015610adb576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601b8152602001807f536166654d6174683a206164646974696f6e206f766572666c6f77000000000081525060200191505060405180910390fd5b8091505092915050565b6000808211610af357600080fd5b600080839050680100000000000000008110610b1757604081901c90506040820191505b6401000000008110610b3157602081901c90506020820191505b620100008110610b4957601081901c90506010820191505b6101008110610b6057600881901c90506008820191505b60108110610b7657600481901c90506004820191505b60048110610b8c57600281901c90506002820191505b60028110610b9b576001820191505b60006040808403901b9050600083607f0386901b9050600067800000000000000090505b6000811115610bf3578182029150600060ff83901c905080607f0183901c92508082028401935050600181901c9050610bbf565b5081945050505050919050565b600080831415610c135760009050610c80565b6000828402905082848281610c2457fe5b0414610c7b576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526021815260200180610e0d6021913960400191505060405180910390fd5b809150505b92915050565b6000838311158290610d33576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825283818151815260200191508051906020019080838360005b83811015610cf8578082015181840152602081019050610cdd565b50505050905090810190601f168015610d255780820380516001836020036101000a031916815260200191505b509250505060405180910390fd5b5060008385039050809150509392505050565b60008083118290610df2576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825283818151815260200191508051906020019080838360005b83811015610db7578082015181840152602081019050610d9c565b50505050905090810190601f168015610de45780820380516001836020036101000a031916815260200191505b509250505060405180910390fd5b506000838581610dfe57fe5b04905080915050939250505056fe536166654d6174683a206d756c7469706c69636174696f6e206f766572666c6f774245484f444c45523a206c6971756964697479207769746864726177616c20746f6f206c617267652ea2646970667358221220fc8d4dedcbd73a606b6deb2b643d5bce7f40e9d1327dd267af0a6166b2403d3a64736f6c63430007060033')
        // getBehodlerBytecode(solcOutput)
        const address = await deployContract(vm, accountPk, byteCode)
        setContractAddress(address)
    }, [accountAddress])

    useEffect(() => {
        initializeVMCallback()
    }, [])


    const populateContextProps = useCallback(async () => {
        if (!contractAddress && EVM) return;

        const addLiquidityCreator = (vm: VM, contractAddress: Address, caller: Address) => (amount: string, reserve: string, fee: number) => getAddLiquidityCall(vm, contractAddress, caller, amount, reserve, fee)
        const withdrawLiquidityCreator = (vm: VM, contractAddress: Address, caller: Address) => (tokensToRelease: string, reserve: string, scxBalance: string) => getWithdrawLiquidityCall(vm, contractAddress, caller, tokensToRelease, reserve, scxBalance)
        const withdrawLiquidityFindSCXCreator = (vm: VM, contractAddress: Address, caller: Address) => (reserve: string, tokensToRelease: string, scx: string, passes: number) => getWithdrawLiquidityFindSCXCall(vm, contractAddress, caller, reserve, tokensToRelease, scx, passes)
        const swapCreator = (vm: VM, contractAddress: Address, caller: Address) => (inputAmount: string, outputAmount: string, initialInputBalance: string, initialOutputBalance: string, fee: number) => getSwapCall(vm, contractAddress, caller, inputAmount, outputAmount, initialInputBalance, initialOutputBalance, fee)
        if (contractAddress) {
            setContextProps({
                addLiquidity: addLiquidityCreator(EVM, contractAddress, accountAddress),
                withdrawLiquidity: withdrawLiquidityCreator(EVM, contractAddress, accountAddress),
                withdrawLiquidityFindSCX: withdrawLiquidityFindSCXCreator(EVM, contractAddress, accountAddress),
                swap: swapCreator(EVM, contractAddress, accountAddress)
            })
        }
    }, [contractAddress])

    useEffect(() => {
        populateContextProps()
    }, [contractAddress])

    return <StatelessBehodlerContext.Provider value={contextProps}>{props.children}</StatelessBehodlerContext.Provider>
}


async function deployContract(
    vm: VM,
    senderPrivateKey: Buffer,
    deploymentBytecode: Buffer,
): Promise<Address> {
    // Contracts are deployed by sending their deployment bytecode to the address 0
    // The contract params should be abi-encoded and appended to the deployment bytecode.
    const txData = {
        value: 0,
        gasLimit: 200000000, // We assume that 2M is enough,
        gasPrice: 1,
        data: '0x' + deploymentBytecode,
        nonce: await getAccountNonce(vm, senderPrivateKey),
        gas: 200000000
    }
    const tx = Transaction.fromTxData(txData).sign(senderPrivateKey)

    const deploymentResult = await vm.runTx({ tx })

    if (deploymentResult.execResult.exceptionError) {
        console.log('error in deployment: ' + JSON.stringify(deploymentResult.execResult.exceptionError))
    }

    return deploymentResult.createdAddress!
}

async function getAccountNonce(vm: VM, accountPrivateKey: Buffer) {
    const address = Address.fromPrivateKey(accountPrivateKey)
    const account = await vm.stateManager.getAccount(address)
    return account.nonce
}

async function getAddLiquidityCall(vm: VM, contractAddress: Address, caller: Address, amount: string, reserve: string, fee: number): Promise<string[]> {
    const params = AbiCoder.encode(['uint256', 'uint256', 'uint256'], [amount, reserve, fee.toString()])
    const sigHash = new Interface(['function addLiquidity(uint256,uint256,uint256)']).getSighash('addLiquidity')
    const addLiquidityResult = await vm.runCall({
        to: contractAddress,
        data: Buffer.from(sigHash.slice(2) + params.slice(2), 'hex'),
        caller: caller,
        origin: caller
    })

    const results = AbiCoder.decode(['uint256', 'string'], addLiquidityResult.execResult.returnValue)

    return results.map(i => i.toString())
}

async function getWithdrawLiquidityCall(vm: VM, contractAddress: Address, caller: Address, tokensToRelease: string, reserve: string, scxBalance: string): Promise<string[]> {
    const params = AbiCoder.encode(['uint256', 'uint256', 'uint256'], [ tokensToRelease,reserve, scxBalance])
    const sigHash = new Interface(['function withdrawLiquidity(uint256,uint256,uint256)']).getSighash('withdrawLiquidity')

    const withdrawLiquidityResult = await vm.runCall({
        to: contractAddress,
        data: Buffer.from(sigHash.slice(2) + params.slice(2), 'hex'),
        caller: caller,
        origin: caller
    })

    const results = AbiCoder.decode(['uint', 'string'], withdrawLiquidityResult.execResult.returnValue)

    return results.map(i => i.toString())
}

async function getWithdrawLiquidityFindSCXCall(vm: VM, contractAddress: Address, caller: Address, reserve: string, tokensToRelease: string, scx: string, passes: number): Promise<string> {
    const params = AbiCoder.encode(['uint256', 'uint256', 'uint256','uint256'], [reserve, tokensToRelease, scx, passes.toString()])
    const sigHash = new Interface(['function withdrawLiquidityFindSCX(uint256,uint256,uint256,uint256)']).getSighash('withdrawLiquidityFindSCX')

    const withdrawLiquidityResult = await vm.runCall({
        to: contractAddress,
        data: Buffer.from(sigHash.slice(2) + params.slice(2), 'hex'),
        caller: caller,
        origin: caller
    })

    const results = AbiCoder.decode(['uint256'], withdrawLiquidityResult.execResult.returnValue)

    return results[0].toString()
}

async function getSwapCall(vm: VM, contractAddress: Address, caller: Address, inputAmount: string, outputAmount: string, initialInputBalance: string, initialOutputBalance: string, fee: number): Promise<string[]> {
    const params = AbiCoder.encode(['uint256', 'uint256', 'uint256','uint256, uint256'], [inputAmount, outputAmount, initialInputBalance, initialOutputBalance,fee])
    const sigHash = new Interface(['function swap(uint256,uint256,uint256,uint256,uint256)']).getSighash('swap')

    const swapResult = await vm.runCall({
        to: contractAddress,
        data:Buffer.from(sigHash.slice(2) + params.slice(2), 'hex'),
        caller: caller,
        origin: caller
    })

    const results = AbiCoder.decode(['uint256', 'string'], swapResult.execResult.returnValue)

    return results.map(i => i.toString())
}


export { StatelessBehodlerContext, StatelessBehodlerContextProvider }
