import { WarpFactory, defaultCacheOptions } from "warp-contracts/web";
import {
  add,
  compose,
  propEq,
  values,
  length,
  prop,
  filter,
  reduce,
  pluck,
  path,
  takeLast
} from "ramda";
import Stamps from "@permaweb/stampjs";

const server = import.meta.env.DEV
  ? "arweave.net"
  : takeLast(2, globalThis.location.host.split(".")).join(".")

const arweave = Arweave.init({
  host: server,
  port: 443,
  protocol: "https",
});


const warp = WarpFactory.forMainnet({ ...defaultCacheOptions, inMemory: true });
const DRE = "https://dre-1.warp.cc";
const stamps = Stamps.init({ warp, arweave });

const STAMPCOIN = __STAMP_CONTRACT__;
let data = null;

const stampCount = (asset) => stamps.count(asset).then((r) => r.total);

export async function stamp(transactionId) {
  return stamps
    .stamp(transactionId)
    .then((r) => new Promise((resolve) => setTimeout(() => resolve(r), 500)));
}

export async function getCount(asset) {
  return stampCount(asset);
}
