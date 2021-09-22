// File: contracts/openzeppelin/Ownable.sol

// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

library SafeMath {
    /**
     * @dev Returns the addition of two unsigned integers, reverting on
     * overflow.
     *
     * Counterpart to Solidity's `+` operator.
     *
     * Requirements:
     *
     * - Addition cannot overflow.
     */
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a, "SafeMath: addition overflow");

        return c;
    }

    /**
     * @dev Returns the subtraction of two unsigned integers, reverting on
     * overflow (when the result is negative).
     *
     * Counterpart to Solidity's `-` operator.
     *
     * Requirements:
     *
     * - Subtraction cannot overflow.
     */
    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        return sub(a, b, "SafeMath: subtraction overflow");
    }

    /**
     * @dev Returns the subtraction of two unsigned integers, reverting with custom message on
     * overflow (when the result is negative).
     *
     * Counterpart to Solidity's `-` operator.
     *
     * Requirements:
     *
     * - Subtraction cannot overflow.
     */
    function sub(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        require(b <= a, errorMessage);
        uint256 c = a - b;

        return c;
    }

    /**
     * @dev Returns the multiplication of two unsigned integers, reverting on
     * overflow.
     *
     * Counterpart to Solidity's `*` operator.
     *
     * Requirements:
     *
     * - Multiplication cannot overflow.
     */
    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        // Gas optimization: this is cheaper than requiring 'a' not being zero, but the
        // benefit is lost if 'b' is also tested.
        // See: https://github.com/OpenZeppelin/openzeppelin-contracts/pull/522
        if (a == 0) {
            return 0;
        }

        uint256 c = a * b;
        require(c / a == b, "SafeMath: multiplication overflow");

        return c;
    }

    /**
     * @dev Returns the integer division of two unsigned integers. Reverts on
     * division by zero. The result is rounded towards zero.
     *
     * Counterpart to Solidity's `/` operator. Note: this function uses a
     * `revert` opcode (which leaves remaining gas untouched) while Solidity
     * uses an invalid opcode to revert (consuming all remaining gas).
     *
     * Requirements:
     *
     * - The divisor cannot be zero.
     */
    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        return div(a, b, "SafeMath: division by zero");
    }

    /**
     * @dev Returns the integer division of two unsigned integers. Reverts with custom message on
     * division by zero. The result is rounded towards zero.
     *
     * Counterpart to Solidity's `/` operator. Note: this function uses a
     * `revert` opcode (which leaves remaining gas untouched) while Solidity
     * uses an invalid opcode to revert (consuming all remaining gas).
     *
     * Requirements:
     *
     * - The divisor cannot be zero.
     */
    function div(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        require(b > 0, errorMessage);
        uint256 c = a / b;
        // assert(a == b * c + a % b); // There is no case in which this doesn't hold

        return c;
    }

    /**
     * @dev Returns the remainder of dividing two unsigned integers. (unsigned integer modulo),
     * Reverts when dividing by zero.
     *
     * Counterpart to Solidity's `%` operator. This function uses a `revert`
     * opcode (which leaves remaining gas untouched) while Solidity uses an
     * invalid opcode to revert (consuming all remaining gas).
     *
     * Requirements:
     *
     * - The divisor cannot be zero.
     */
    function mod(uint256 a, uint256 b) internal pure returns (uint256) {
        return mod(a, b, "SafeMath: modulo by zero");
    }

    /**
     * @dev Returns the remainder of dividing two unsigned integers. (unsigned integer modulo),
     * Reverts with custom message when dividing by zero.
     *
     * Counterpart to Solidity's `%` operator. This function uses a `revert`
     * opcode (which leaves remaining gas untouched) while Solidity uses an
     * invalid opcode to revert (consuming all remaining gas).
     *
     * Requirements:
     *
     * - The divisor cannot be zero.
     */
    function mod(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        require(b != 0, errorMessage);
        return a % b;
    }
}

/*To following code is sourced from the ABDK library for assistance in dealing with precision logarithms in Ethereum.
 * ABDK Math 64.64 Smart Contract Library.  Copyright © 2019 by ABDK Consulting.
 * Author: Mikhail Vladimirov <mikhail.vladimirov@gmail.com>
 * Source: https://github.com/abdk-consulting/abdk-libraries-solidity/blob/master/ABDKMath64x64.sol#L366
 */
library ABDK {
    /*
     * Minimum value signed 64.64-bit fixed point number may have.
     */
    int128 private constant MIN_64x64 = -0x80000000000000000000000000000000;

    /*
     * Maximum value signed 64.64-bit fixed point number may have.
     */
    int128 private constant MAX_64x64 = 0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF;

    /**
     * Convert unsigned 256-bit integer number into signed 64.64-bit fixed point
     * number.  Revert on overflow.
     *
     * @param x unsigned 256-bit integer number
     * @return signed 64.64-bit fixed point number
     */
    function fromUInt(uint256 x) internal pure returns (int128) {
        require(x <= 0x7FFFFFFFFFFFFFFF);
        return int128(x << 64);
    }

    /**
     * Calculate x + y.  Revert on overflow.
     *
     * @param x signed 64.64-bit fixed point number
     * @param y signed 64.64-bit fixed point number
     * @return signed 64.64-bit fixed point number
     */
    function add(int128 x, int128 y) internal pure returns (int128) {
        int256 result = int256(x) + y;
        require(result >= MIN_64x64 && result <= MAX_64x64);
        return int128(result);
    }

    /**
     * Calculate binary logarithm of x.  Revert if x <= 0.
     *
     * @param x signed 64.64-bit fixed point number
     * @return signed 64.64-bit fixed point number
     */
    function log_2(uint256 x) internal pure returns (uint256) {
        require(x > 0);

        uint256 msb = 0;
        uint256 xc = x;
        if (xc >= 0x10000000000000000) {
            xc >>= 64;
            msb += 64;
        }
        if (xc >= 0x100000000) {
            xc >>= 32;
            msb += 32;
        }
        if (xc >= 0x10000) {
            xc >>= 16;
            msb += 16;
        }
        if (xc >= 0x100) {
            xc >>= 8;
            msb += 8;
        }
        if (xc >= 0x10) {
            xc >>= 4;
            msb += 4;
        }
        if (xc >= 0x4) {
            xc >>= 2;
            msb += 2;
        }
        if (xc >= 0x2) msb += 1; // No need to shift xc anymore

        uint256 result = (msb - 64) << 64;
        uint256 ux = uint256(x) << uint256(127 - msb);
        for (uint256 bit = 0x8000000000000000; bit > 0; bit >>= 1) {
            ux *= ux;
            uint256 b = ux >> 255;
            ux >>= 127 + b;
            result += bit * b;
        }

        return result;
    }
}

/*
	Behodler orchestrates trades using an omnischedule bonding curve.
	The name is inspired by the Beholder of D&D, a monster with multiple arms ending in eyes peering in all directions.
	The Behodler is a smart contract that can see the prices of all tokens simultaneously without need for composition or delay.
	The hodl part of Behodler refers to the fact that with every trade of a token pair, the liquidity pool of each token held by Behodler increases

    Behodler 1 performed square root calculations which are gas intensive for fixed point arithmetic algorithms.
    To save gas, Behodler2 never performs square root calculations. It just checks the numbers passed in by the user and reverts if needs be.
    This techique is called invariant checking and offloads maximum calculation to clients while guaranteeing no cheating is possible.
    In Behodler 1 some operations were duplicated. For instance, a swap was a scarcity purchase followed by a scarcity sale. Instead, cutting out
    the middle scarcity allows the factor scaling to be dropped altogether.

    By bringing Scarcity, Janus, Kharon and Behodler together in one contract, Behodler 2 avoids the EXT_CALL gas fees and can take gas saving shortcuts with Scarcity
    transfers. The drawback to this approach is less flexibility with fees in the way that Kharon allowed.

    Behodler 2 now has Flashloan support. Instead of charging a liquidity growing fee, Behodler 2 requires the user fulfil some requirement
    such as holding an NFT or staking Scarcity. This allows for zero fee flash loans that are front runner resistant and
    allows a secondary flashloan market to evolve.
 */
contract BehodlerStateless  {
    using SafeMath for uint256;
    using ABDK for int128;
    using ABDK for uint256;

    struct PrecisionFactors {
        uint8 swapPrecisionFactor;
        uint8 maxLiquidityExit; //percentage as number between 1 and 100
    }
    PrecisionFactors safetyParameters;

    constructor() {
        safetyParameters.swapPrecisionFactor = 30; //approximately a billion
        safetyParameters.maxLiquidityExit = 90;
    }

    function setSafetParameters(
        uint8 swapPrecisionFactor,
        uint8 maxLiquidityExit
    ) external {
        safetyParameters.swapPrecisionFactor = swapPrecisionFactor;
        safetyParameters.maxLiquidityExit = maxLiquidityExit;
    }

    function getMaxLiquidityExit() public view returns (uint8) {
        return safetyParameters.maxLiquidityExit;
    }

    //Logarithmic growth can get quite flat beyond the first chunk. We divide input amounts by
    uint256 public constant MIN_LIQUIDITY = 1e12;

    /*
    Note that instead of reverting, we return a reason string to assist with the natural 
    flow of UX.
    fee is a percentage expressed as a number between 0 and 1000
 */
    function swap(
        uint256 inputAmount,
        uint256 outputAmount,
        uint initialInputBalance,
        uint initialOutputBalance, 
        uint fee
    )
        external
        view
        returns (bool, string memory)
    {
        
        uint256 netInputAmount =
            inputAmount.sub(burnToken( inputAmount, fee));

        bool sufficientLiquidity =   outputAmount.mul(100).div(initialOutputBalance) <=
                safetyParameters.maxLiquidityExit;
                if(!sufficientLiquidity){
                    return (false,  "BEHODLER: liquidity withdrawal too large.");
                }
    
        uint256 finalInputBalance = initialInputBalance.add(netInputAmount);
        uint256 finalOutputBalance = initialOutputBalance.sub(outputAmount);

        //new scope to avoid stack too deep errors.
        {
            //if the input balance after adding input liquidity is 1073741824 bigger than the initial balance, we revert.
            uint256 inputRatio =
                (initialInputBalance << safetyParameters.swapPrecisionFactor)
                    .div(finalInputBalance);
            uint256 outputRatio =
                (finalOutputBalance << safetyParameters.swapPrecisionFactor)
                    .div(initialOutputBalance);
            bool swapInvariant =  inputRatio != 0 && inputRatio == outputRatio;
            if(!swapInvariant){
                return (false,  "BEHODLER: swap invariant.");
            }
        }
    
        bool minLiquidityMaintained =  finalOutputBalance >= MIN_LIQUIDITY;
        if(!minLiquidityMaintained)
        return (false,"BEHODLER: min liquidity.");
      return (true,"");
    }

    /*
        ΔSCX = log(FinalBalance) - log(InitialBalance)

        fee is a percentage expressed as a number between 0 and 1000
     */
    function addLiquidity(uint256 amount, uint reserve, uint fee)
        external
        pure
        returns (uint256, string memory)
    {
        uint256 initialBalance =
            uint256((reserve/MIN_LIQUIDITY).fromUInt());
        uint256 netInputAmount =
            uint256(
                amount
                    .sub(burnToken(amount,fee))
                    .div(MIN_LIQUIDITY)
                    .fromUInt()
            );

        uint256 finalBalance = uint256(initialBalance.add(netInputAmount));
        bool minLiquidityMaintained =  uint256(finalBalance) >= MIN_LIQUIDITY;
        if(!minLiquidityMaintained)
        return (0,    "BEHODLER: min liquidity.");
      
       uint deltaSCX = uint256(
            finalBalance.log_2() -
                (initialBalance > 1 ? initialBalance.log_2() : 0)
        );
        return (deltaSCX, "");
    }

    /*
        ΔSCX =  log(InitialBalance) - log(FinalBalance)
        tokensToRelease = InitialBalance -FinalBalance
        =>FinalBalance =  InitialBalance - tokensToRelease
        Then apply logs and deduct SCX from msg.sender

        The choice of base for the log isn't relevant from a mathematical point of view
        but from a computational point of view, base 2 is the cheapest for obvious reasons.
        "From my point of view, the Jedi are evil" - Darth Vader
     */
    function withdrawLiquidity(uint256 tokensToRelease, uint reserve, uint scxBalance)
        external
        view
        returns (uint256, string memory)
    {
        //First Rule of Warfare: minimal changes => minimal bugs
        uint256 initialBalance =reserve;
        uint256 finalBalance = initialBalance.sub(tokensToRelease);
        bool minLiquidityMaintained = finalBalance > MIN_LIQUIDITY;
        if(!minLiquidityMaintained)
            return (0,"BEHODLER: min liquidity");
      
      
        bool withdrawalSizeSafe = tokensToRelease.mul(100).div(initialBalance) <=
                safetyParameters.maxLiquidityExit;
        if(!withdrawalSizeSafe)
                return (0,  "BEHODLER: liquidity withdrawal too large.");
     

        uint256 logInitial = initialBalance.log_2();
        uint256 logFinal = finalBalance.log_2();

        uint deltaSCX = logInitial - (finalBalance > 1 ? logFinal : 0);

        if (deltaSCX > scxBalance) {
            //rounding errors in scx creation and destruction. Err on the side of holders
            uint256 difference = deltaSCX - scxBalance;
            if ((difference * 10000) / deltaSCX == 0) deltaSCX = scxBalance;
        }
        return (deltaSCX, "");
    }

    /*
        ΔSCX =  log(InitialBalance) - log(FinalBalance)
        tokensToRelease = InitialBalance -FinalBalance
        =>FinalBalance =  InitialBalance - tokensToRelease
        Then apply logs and deduct SCX from msg.sender

        The choice of base for the log isn't relevant from a mathematical point of view
        but from a computational point of view, base 2 is the cheapest for obvious reasons.
        "From my point of view, the Jedi are evil" - Darth Vader
     */
    function withdrawLiquidityFindSCX(
        uint reserve,
        uint256 tokensToRelease,
        uint256 scx,
        uint256 passes
    ) external pure returns (uint256) {
        uint256 upperBoundary =reserve;
        uint256 lowerBoundary = 0;

        for (uint256 i = 0; i < passes; i++) {
            uint256 initialBalance = reserve;
            uint256 finalBalance = initialBalance.sub(tokensToRelease);

            uint256 logInitial = initialBalance.log_2();
            uint256 logFinal = finalBalance.log_2();

            int256 deltaSCX =
                int256(logInitial - (finalBalance > 1 ? logFinal : 0));
            int256 difference = int256(scx) - deltaSCX;
            // if (difference**2 < 1000000) return tokensToRelease;
            if (difference == 0) return tokensToRelease;
            if (difference < 0) {
                // too many tokens requested
                upperBoundary = tokensToRelease - 1;
            } else {
                //too few tokens requested
                lowerBoundary = tokensToRelease + 1;
            }
            tokensToRelease =
                ((upperBoundary - lowerBoundary) / 2) +
                lowerBoundary; //bitshift
            tokensToRelease = tokensToRelease > initialBalance
                ? initialBalance
                : tokensToRelease;
        }
        return tokensToRelease;
    }

    function burnToken(uint256 amount, uint fee)
        private
        pure
        returns (uint256)
    {
        return fee.mul(amount).div(1000);
       
    }
}
