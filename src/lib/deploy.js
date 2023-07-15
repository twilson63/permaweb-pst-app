import fileReaderStream from "https://esm.sh/filereader-stream";
import { split, map, trim, append, takeLast } from "ramda";
import { WarpFactory } from "warp-contracts";
import { DeployPlugin } from "warp-contracts-plugin-deploy";

const arweave = Arweave.init({
  host: import.meta.env.DEV
    ? "arweave.net"
    : takeLast(2, globalThis.location.host.split(".")).join("."),
  port: 443,
  protocol: "https",
});

const SRC = __ASSET_SOURCE__;
const UDL = "yRj4a5KMctX_uOmKWCFJIjmY8DeJcusVk6-HzLiM_t8";

const warp = WarpFactory.forMainnet().use(new DeployPlugin());

const toArrayBuffer = (file) =>
  new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.readAsArrayBuffer(file);
    fr.addEventListener("loadend", (evt) => {
      resolve(evt.target.result);
    });
  });

export async function fund() { }

export async function deploy(bundlr, asset) {
  let assetType = asset.file.type.split("/")[0] || "image";

  if (assetType === "application") {
    assetType = asset.file.type.split("/")[1];
  }

  const topicData = map(trim, split(",", asset.topics)).map((t) => ({
    name: "Topic:" + t,
    value: t,
  }));

  const addr = await window.arweaveWallet.getActiveAddress();

  let _tags = [
    { name: "Content-Type", value: asset.file.type },
    { name: 'Indexed-By', value: 'ucm' },
    { name: "License", value: UDL },
    { name: "App-Name", value: "SmartWeaveContract" },
    { name: "App-Version", value: "0.3.0" },
    { name: "Contract-Manifest", value: '{"evaluationOptions":{"sourceType":"redstone-sequencer","allowBigInt":true,"internalWrites":true,"unsafeClient":"skip","useConstructor":true}}'},
    { name: "Contract-Src", value: SRC },
    {
      name: "Init-State",
      value: JSON.stringify({
        creator: addr,
        claimable: [],
        ticker: "ATOMIC",
        name: asset.title,
        balances: {
          [addr]: 100,
        },
        emergencyHaltWallet: addr,
        contentType: asset.file.type,
        settings: [["isTradeable", true]],
        transferable: true
      }),
    },
    { name: "Forks", value: asset.forkTX },
    { name: "Creator", value: addr },
    { name: "Title", value: asset.title },
    { name: "Description", value: asset.description },
    { name: "Type", value: assetType },
    { name: "Thumbnail", value: asset.thumbnail },
    ...topicData,
  ];
  if (asset.license === 'derivative') {
    _tags = append({ name: 'Derivation', value: 'Allowed-With-Credit' })
  }
  if (asset.license === 'commercial') {
    _tags = _tags.concat([
      { name: 'Commercial-Use', value: 'Allowed' },
      { name: 'License-Fee', value: 'One-Time-' + asset.payment }
    ])
  }
  if (asset.audioRenderer) {
    _tags = append(
      {
        name: "Render-With",
        value: "f6I-Do04BO2pJysbiYIFjq4NkmjT5iYYWfF6cO-N4mc",
      },
      _tags
    );
  } else if (asset.renderWith) {
    _tags = append({
      name: "Render-With",
      value: asset.renderWith
    }, _tags)
  }
  const dataStream = fileReaderStream(asset.file);
  const result = await bundlr.upload(dataStream, {
    tags: _tags,
  });

  await warp.register(result.id, "node2");
  return result;
}

export async function deployAr(asset) {
  const data = await toArrayBuffer(asset.file);
  const addr = await window.arweaveWallet.getActiveAddress();

  const tx = await arweave.createTransaction({ data });
  tx.addTag("App-Name", "SmartWeaveContract");
  tx.addTag("App-Version", "0.3.0");
  tx.addTag("Content-Type", asset.file.type);
  tx.addTag('Indexed-By', 'ucm');
  tx.addTag('License', UDL);
  tx.addTag('Contract-Manifest', '{"evaluationOptions":{"sourceType":"redstone-sequencer","allowBigInt":true,"internalWrites":true,"unsafeClient":"skip","useConstructor":true}}')
  tx.addTag("Contract-Src", SRC);
  tx.addTag(
    "Init-State",
    JSON.stringify({
      title: asset.title,
      description: asset.description,
      creator: addr,
      ticker: "ATOMIC",
      name: asset.title,
      balances: {
        [addr]: 100,
      },
      contentType: asset.file.type,
      emergencyHaltWallet: addr,
      claimable: [],
      settings: [["isTradeable", true]],
      transferable: true
    })
  );
  tx.addTag("Forks", asset.forkTX);
  tx.addTag("Creator", addr);
  tx.addTag("Title", asset.title);
  tx.addTag("Description", asset.description);
  tx.addTag("Thumbnail", asset.thumbnail);
  let assetType = asset.file.type.split("/")[0] || "image";
  if (assetType === "application") {
    assetType = asset.file.type.split("/")[1];
  }
  tx.addTag("Type", assetType);

  map(trim, split(",", asset.topics)).forEach((t) => {
    tx.addTag("Topic:" + t, t);
  });

  if (asset.license === 'derivative') {
    tx.addTag('Derivation', 'Allowed-With-Credit')
  }
  if (asset.license === 'commercial') {
    tx.addTag('Commercial-Use', 'Allowed')
    tx.addTag('License-Fee', 'One-Time-', + asset.payment)
  }
  if (asset.audioRenderer) {
    tx.addTag("Render-With", "f6I-Do04BO2pJysbiYIFjq4NkmjT5iYYWfF6cO-N4mc");
  } else if (asset.renderWith) {
    tx.addTag("Render-With", asset.renderWith)
  }

  await arweave.transactions.sign(tx);
  const result = await arweave.transactions.post(tx);

  if (result.status === 400) {
    throw new Error("Not enough $AR in wallet to upload pst!");
  } else if (result.status === 200) {
    return tx;
  }
  throw new Error(result.message + " while trying to upload!");
}
