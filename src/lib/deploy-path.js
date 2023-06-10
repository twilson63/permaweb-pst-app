import { compose, toLower, join, split, map, trim } from "ramda";
//import { WarpFactory, defaultCacheOptions } from 'warp-contracts'

const { WarpFactory } = window.warp;

const arweave = Arweave.init({
  host: "arweave.net",
  port: 443,
  protocol: "https",
});

const DRE_NODE = "https://dre-1.warp.cc";
const BAR = __BAR_CONTRACT__;
const SRC = __ASSET_SOURCE__;

const warp = WarpFactory.forMainnet();

/*
 * Need to upload to arweave using post
 * Then create a path manifest to upload to
 * both sequencer and bundlr
 */
//const SRC = 'BzNLxND_nJEMfcLWShyhU4i9BnzEWaATo6FYFsfsO0Q'
const URL = "https://d1o5nlqr4okus2.cloudfront.net/gateway/contracts/deploy";
//const of = Promise.resolve
const slugify = compose(toLower, join("-"), split(" "));

export async function deploy(
  name,
  description,
  addr,
  contentType,
  data,
  topics = "",
  forkTX
) {
  const tx = await arweave.createTransaction({ data });
  tx.addTag("App-Name", "SmartWeaveContract");
  tx.addTag("App-Version", "0.3.0");
  tx.addTag("Content-Type", contentType);

  tx.addTag("Contract-Src", SRC);
  tx.addTag(
    "Init-State",
    JSON.stringify({
      creator: addr,
      ticker: "PST-ASSET",
      balances: {
        [addr]: 10000,
      },
      contentType: contentType,
      emergencyHaltWallet: addr,
      pairs: [],
      settings: [["isTradeable", true]],
    })
  );
  tx.addTag("Forks", forkTX);
  tx.addTag("Creator", addr);
  tx.addTag("Title", name);
  tx.addTag("Description", description);
  let assetType = contentType.split("/")[0] || "image";
  if (assetType === "application") {
    assetType = contentType.split("/")[1];
  }
  tx.addTag("Type", assetType);

  map(trim, split(",", topics)).forEach((t) => {
    tx.addTag("Topic:" + t, t);
  });

  await arweave.transactions.sign(tx);
  const result = await arweave.transactions.post(tx);

  if (result.status === 400) {
    throw new Error("Not enough $AR in wallet to upload pst!");
  } else if (result.status === 200) {
    return tx;
  }
  throw new Error(result.message + " while trying to upload!");
}

export async function deployBundlr(
  name,
  description,
  addr,
  contentType,
  assetId,
  topics = "",
  forkTX
) {
  return Promise.resolve({
    name,
    description,
    addr,
    contentType,
    assetId,
    topics,
    forkTX,
  })
    .then(dispatch)
    .then(post);
}

async function post(ctx) {
  const result = await warp.register(ctx.atomicId, "node2");
  return { id: ctx.atomicId };
}

async function dispatch(ctx) {
  const tx = await createAndTag(ctx);
  const result = await arweaveWallet.dispatch(tx);
  return { ...ctx, atomicId: result.id };
}

async function createAndTag(ctx) {
  const tx = await arweave.createTransaction({
    data: JSON.stringify({
      manifest: "arweave/paths",
      version: "0.1.0",
      index: {
        path: "asset",
      },
      paths: {
        asset: {
          id: ctx.assetId,
        },
      },
    }),
  });
  tx.addTag("App-Name", "SmartWeaveContract");
  tx.addTag("App-Version", "0.3.0");
  tx.addTag("Content-Type", "application/x.arweave-manifest+json");
  tx.addTag("Contract-Src", SRC);
  tx.addTag(
    "Init-State",
    JSON.stringify({
      ticker: "ATOMIC-ASSET-" + ctx.assetId,
      balances: {
        [ctx.addr]: 10000,
      },
      claimable: [],
      claims: [],
      contentType: ctx.contentType,
      emergencyHaltWallet: ctx.addr,
      pairs: [],
      invocations: [],
      foreignCalls: [],
      settings: [["isTradeable", true]],
    })
  );
  tx.addTag("Forks", ctx.forkTX);
  tx.addTag("Title", ctx.name);
  tx.addTag("Description", ctx.description);
  const assetType = ctx.contentType.split("/")[0] || "image";
  if (assetType === "application") {
    const assetType = ctx.contentType.split("/")[1];
  }
  tx.addTag("Type", assetType);

  map(trim, split(",", ctx.topics)).forEach((t) => {
    tx.addTag("Topic:" + t, t);
  });

  return tx;
}

async function upload(ctx) {
  const tx = await arweave.createTransaction({ data: ctx.data });
  tx.addTag("Content-Type", ctx.contentType);
  // earn bar while you upload
  tx.addTag("Protocol-Name", "BAR");
  tx.addTag("Action", "Burn");
  tx.addTag("App-Name", "SmartWeaveAction");
  tx.addTag("App-Version", "0.3.0");
  tx.addTag("Input", JSON.stringify({ function: "mint" }));
  tx.addTag("Contract", BAR);

  await arweave.transactions.sign(tx);
  const result = await arweave.transactions.post(tx);

  if (result.status === 400) {
    throw new Error("Not enough $AR in wallet to upload img!");
  } else if (result.status === 200) {
    return { ...ctx, assetId: tx.id };
  }
  throw new Error(result.message + " while trying to upload!");
}
