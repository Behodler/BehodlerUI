import { Effect  } from './common'
import EffectBase from './EffectBase'

export default abstract class Token extends EffectBase {
    abstract totalSupplyEffect(): Effect
    abstract balanceOfEffect(holder: string): Effect
    abstract allowance(owner: string, spender: string): Effect
}