import { WarpFactory, LoggerFactory } from "warp-contracts";
import { prop } from "ramda";

LoggerFactory.INST.logLevel("fatal");
const warp = WarpFactory.forMainnet();
const options = {
  allowBigInt: true,
  internalWrites: true,
  unsafeClient: "skip",
  remoteStateSyncEnabled: true,
  remoteStateSyncSource: 'https://dre-u.warp.cc/contract'
};

export const readState = (id) =>
  warp
    .contract(id)
    .setEvaluationOptions(options)
    .readState();


export function write(contract, input) {
  return warp
    .contract(contract)
    .connect("use_wallet")
    .setEvaluationOptions(options)
    .writeInteraction(input);
}

export function viewState(contract, input) {
  return warp
    .contract(contract)
    .setEvaluationOptions(options)
    .viewState(input)
    .then(prop("result"));
}
