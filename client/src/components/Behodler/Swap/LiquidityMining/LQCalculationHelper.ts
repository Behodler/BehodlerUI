const weekSeconds = 604800
const yearSeconds = 31536000
export function GetAPY(ROI: number, queueVelocity: number, queueSize: number): number {
    if (queueVelocity === 0)
        return ROI;
    const term = (1 + ROI)
    const queueMovementPeriods = weekSeconds / queueVelocity;
    const totalQueueDuration = queueMovementPeriods * queueSize;
    const compoundingsPerYear = yearSeconds / totalQueueDuration
    const APY = Math.pow(term, compoundingsPerYear) - 1
    return APY
}

/*
 ) external pure returns (uint256 apy) {
        if (velocity == 0) return ROI;
        uint256 queueMovementPeriods = weekSeconds() / velocity; //avoid division by zero
        uint256 totalDurationInQueue = queueMovementPeriods * queueSize;
        //5 days = positionDuration * queueSize.
        //let queueSize = 21
        //positionDuration = 5days/21
        //velocity = 1 week/ (5 days/21)
        uint256 compoundingPeriodsPerYear = yearSeconds() / totalDurationInQueue;
        uint factor = 10000**compoundingPeriodsPerYear;
        apy = ((1+ROI)**compoundingPeriodsPerYear)/factor;
       // apy= rpow((1 + ROI), compoundingPeriodsPerYear, 10000);
    }
*/