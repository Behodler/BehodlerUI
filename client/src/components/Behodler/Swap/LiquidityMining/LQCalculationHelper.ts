const weekSeconds = 604800
const yearSeconds = 31536000
export function GetAPY(ROI: number, queueVelocity: number, queueSize: number): number {
    if (queueVelocity === 0)
        return ROI

    const queueMovementPeriods = weekSeconds / (queueVelocity + 1);
    const totalQueueDuration = queueMovementPeriods * queueSize;
    const compoundingsPerYear = yearSeconds / (totalQueueDuration + 1)
    const term = (1 + ROI / (compoundingsPerYear * 100))
    const APY = (Math.pow(term, compoundingsPerYear) - 1)*100
    return APY
}
