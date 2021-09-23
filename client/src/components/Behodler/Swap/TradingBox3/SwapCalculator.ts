import API from '../../../../blockchain/ethereumAPI'

enum TradeStatus {
    clean,
    InputNaN,
    OutputNaN,
    BothNaN,
    ReserveInLow,
    ReserveOutLow,
    BothReservesLow,
}
const MIN_LIQUIDITY: bigint = BigInt(1000000000000)
type relevantParam = string | '-'

class Trade {
    reserveIn: bigint
    reserveOut: bigint
    amountIn: bigint
    amountOut: bigint
    status: TradeStatus = TradeStatus.clean
    constructor(reserveIn: relevantParam, reserveOut: relevantParam, amountIn: relevantParam, amountOut: relevantParam) {
        if (amountIn !== '-') {
            const amountInNum = parseFloat(amountIn)
            if (isNaN(amountInNum)) {
                this.status = TradeStatus.InputNaN
            } else {
                this.amountIn = BigInt(API.toWei(amountIn))
            }
        } else amountIn = '0'

        if (amountOut !== '-') {
            const amountOutNum = parseFloat(amountOut)
            if (isNaN(amountOutNum)) {
                this.status = this.status === TradeStatus.InputNaN ? TradeStatus.BothNaN : TradeStatus.OutputNaN
            } else {
                this.amountOut = BigInt(API.toWei(amountOut))
            }
        } else amountOut = '0'

        if (reserveIn !== '-') {
            this.reserveIn = BigInt(reserveIn)

            if (this.reserveIn < MIN_LIQUIDITY) {
                this.status = TradeStatus.ReserveInLow
            }
        }

        if (reserveOut !== '-') {
            this.reserveOut = BigInt(reserveOut)
            if (this.reserveOut < MIN_LIQUIDITY) {
                this.status = this.status === TradeStatus.ReserveInLow ? TradeStatus.BothReservesLow : TradeStatus.ReserveOutLow
            }
        }
    }

    public amountInWithfee(): bigint {
        return this.amountIn * BigInt(995)
    }

    public static newTrade(reserveIn?: bigint, reserveOut?: bigint, amountIn?: bigint, amountOut?: bigint): Trade {
        return new Trade(
            reserveIn !== undefined ? reserveIn.toString() : '-',
            reserveOut !== undefined ? reserveOut.toString() : '-',
            amountIn !== undefined ? amountIn.toString() : '-',
            amountOut !== undefined ? amountOut.toString() : '-'
        )
    }
}

function OutputGivenInput(reserveIn: string, reserveOut: string, amountIn: string): Trade {
    let trade: Trade = new Trade(reserveIn, reserveOut, amountIn, '-')
    if (trade.status !== TradeStatus.clean) return trade
    const numerator: bigint = trade.amountInWithfee() * trade.reserveOut
    const denominator: bigint = trade.reserveIn * BigInt(1000) + trade.amountInWithfee()
    const amountOut: bigint = numerator / denominator
    return Trade.newTrade(trade.reserveIn, trade.reserveOut, trade.amountIn, amountOut)
}

function InputGivenOutput(reserveIn: string, reserveOut: string, amountOut: string): Trade {
    let trade: Trade = new Trade(reserveIn, reserveOut, '-', amountOut)
    if (trade.status !== TradeStatus.clean) return trade

    const numerator = trade.reserveIn * trade.amountOut * BigInt(1000)
    const denominator = (trade.reserveOut - trade.amountOut) * BigInt(995)
    const amountIn: bigint = numerator / denominator
    return Trade.newTrade(trade.reserveIn, trade.reserveOut, amountIn, trade.amountOut)
}

function PriceImpactSwap(reserveIn: string, reserveOut: string, actualAmountIn: string, actualAmountOut: string): Trade {
    let trade: Trade = new Trade(reserveIn, reserveOut, actualAmountIn, actualAmountOut)
    if (trade.status !== TradeStatus.clean) return trade

    //TODO: complete implemenation
    return trade
}

export { OutputGivenInput, InputGivenOutput, PriceImpactSwap, Trade, TradeStatus }
