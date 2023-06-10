import { WarpFactory, LoggerFactory } from "warp-contracts";
import { prop } from "ramda";

LoggerFactory.INST.logLevel("fatal");
const warp = WarpFactory.forMainnet();
const options = {
  allowBigInt: true,
  internalWrites: true,
  unsafeClient: "skip",
  //remoteStateSyncEnabled: true
};

export const readState = (id) =>
  warp
    .contract(id)
    .setEvaluationOptions(options)
    .readState()
    .catch((e) =>
      warp
        .contract(id)
        .setEvaluationOptions({
          ...options,
          remoteStateSyncSource: "https://dre-5.warp.cc/contract",
        })
        .readState()
    )
    .catch((e) =>
      warp
        .contract(id)
        .setEvaluationOptions({
          ...options,
          remoteStateSyncSource: "https://dre-6.warp.cc/contract",
        })
        .readState()
    )
    .catch((e) =>
      warp
        .contract(id)
        .setEvaluationOptions({
          ...options,
          remoteStateSyncSource: "https://dre-2.warp.cc/contract",
        })
        .readState()
    );

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
