import { WarpFactory } from 'warp-contracts'

const warp = WarpFactory.forMainnet()
const options = {
  allowBigInt: true,
  internalWrites: true,
  unsafeClient: 'skip',
  remoteStateSyncEnabled: true
}

export const readState = (id) => warp.contract(id)
  .setEvaluationOptions(options)
  .readState()