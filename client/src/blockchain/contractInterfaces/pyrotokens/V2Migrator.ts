import { address, uint256 } from '../SolidityTypes'
import { BaseContract } from '../BaseContract'

type MigratingPyrotokenV2Address = address
type TargetPyrotokenV3Address = address

export interface V2Migrator extends BaseContract{
    migrate: (
        pyro2Address: MigratingPyrotokenV2Address,
        pyro3Address: TargetPyrotokenV3Address,
        pyro2Amount: uint256,
        pyro3Amount: uint256,
    ) => any,

    migrateMany: (
        pyro2Addresses: MigratingPyrotokenV2Address[],
        pyro3Addresses: TargetPyrotokenV3Address[],
        pyro2Amounts: uint256[],
        pyro3Amounts: uint256[],
    ) => any,
}
