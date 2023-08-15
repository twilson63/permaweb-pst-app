import { WarpFactory, defaultCacheOptions } from "warp-contracts";
import { InjectedArweaveSigner } from 'warp-contracts-plugin-signature'
import { ArweaveWebWallet } from 'arweave-wallet-connector'
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
const DRE = 'https://dre-u.warp.cc/contract'
const STAMPCOIN = __STAMP_CONTRACT__;
let data = null;

const stampCount = (asset) => {
  const stamps = Stamps.init({ warp, arweave, wallet: getSigner(), DRE });
  return stamps.count(asset).then((r) => r.total);
}

export async function stamp(transactionId) {
  const userSigner = getSigner()
  const stamps = Stamps.init({ warp, arweave, wallet: userSigner, dre: DRE });
  return stamps.stamp(transactionId)
    .then((r) => new Promise((resolve) => setTimeout(() => resolve(r), 500)));
}

export async function getCount(asset) {
  return stampCount(asset);
}

async function getSigner() {
  let userSigner = null
  if (globalThis.arweaveWallet) {
    userSigner = new InjectedArweaveSigner(globalThis.arweaveWallet);
  } else {
    const wallet = new ArweaveWebWallet({
      name: "foo",
    });
    wallet.setUrl("arweave.app");
    await wallet.connect();
    userSigner = new InjectedArweaveSigner(wallet);
  }

  userSigner.getAddress = globalThis.arweaveWallet.getActiveAddress;
  await userSigner.setPublicKey();
  return userSigner
}