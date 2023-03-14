import fileReaderStream from "https://esm.sh/filereader-stream";
import { split, map, trim, append } from "ramda";

const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https'
})

const SRC = __ASSET_SOURCE__

const { WarpFactory } = window.warp;
const warp = WarpFactory.forMainnet();

const toArrayBuffer = (file) =>
  new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.readAsArrayBuffer(file);
    fr.addEventListener("loadend", (evt) => {
      resolve(evt.target.result);
    });
  });

export async function fund() {

}

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
    { name: "App-Name", value: "SmartWeaveContract" },
    { name: "App-Version", value: "0.3.0" },
    { name: "Contract-Src", value: SRC },
    {
      name: "Init-State",
      value: JSON.stringify({
        creator: addr,
        pairs: [],
        ticker: "PST",
        balances: {
          [addr]: 1 * 1e6,
        },
        emergencyHaltWallet: addr,
        contentType: asset.file.type,
        settings: [["isTradeable", true]],
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
  if (asset.audioRenderer) {
    _tags = append({ name: 'Render-With', value: 'f6I-Do04BO2pJysbiYIFjq4NkmjT5iYYWfF6cO-N4mc' }, _tags)
  }
  const dataStream = fileReaderStream(asset.file);
  const result = await bundlr.upload(dataStream, {
    tags: _tags,
  });

  await warp.register(result.id, "node2");
  return result
}

export async function deployAr(asset) {
  const data = await toArrayBuffer(asset.file);
  const addr = await window.arweaveWallet.getActiveAddress();
  console.log(data)
  const tx = await arweave.createTransaction({ data })
  tx.addTag('App-Name', 'SmartWeaveContract')
  tx.addTag('App-Version', '0.3.0')
  tx.addTag('Content-Type', asset.file.type)

  tx.addTag('Contract-Src', SRC)
  tx.addTag('Init-State', JSON.stringify({
    creator: addr,
    ticker: "PST-ASSET",
    balances: {
      [addr]: 10000
    },
    contentType: asset.file.type,
    emergencyHaltWallet: addr,
    pairs: [],
    settings: [["isTradeable", true]]
  }))
  tx.addTag('Forks', asset.forkTX)
  tx.addTag('Creator', addr)
  tx.addTag('Title', asset.title)
  tx.addTag('Description', asset.description)
  tx.addTag('Thumbnail', asset.thumbnail)
  let assetType = asset.file.type.split('/')[0] || 'image'
  if (assetType === 'application') {
    assetType = asset.file.type.split('/')[1]
  }
  tx.addTag('Type', assetType)

  map(trim, split(',', asset.topics)).forEach(t => {
    tx.addTag('Topic:' + t, t)
  })

  if (asset.audioRenderer) {
    tx.addTag('Render-With', 'f6I-Do04BO2pJysbiYIFjq4NkmjT5iYYWfF6cO-N4mc')
  }

  await arweave.transactions.sign(tx)
  const result = await arweave.transactions.post(tx)

  if (result.status === 400) {
    throw new Error('Not enough $AR in wallet to upload pst!')
  } else if (result.status === 200) {
    return tx
  }
  throw new Error(result.message + ' while trying to upload!')

}