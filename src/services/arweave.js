import { ArweaveWebWallet } from "arweave-wallet-connector";

export async function address() {
  if (globalThis.arweaveWallet) {
    return await globalThis.arweaveWallet.getActiveAddress();
  }
  const wallet = new ArweaveWebWallet({ name: "flex-example" });
  wallet.setUrl("arweave.app");
  await wallet.connect();
  return await globalThis.arweaveWallet.getActiveAddress();
}
