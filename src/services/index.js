import { address } from './arweave.js'
import { readState, viewState, write } from './warp.js'

export default {
  getAddress: address,
  readState,
  viewState,
  write
}