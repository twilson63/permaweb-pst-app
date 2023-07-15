import {
  assoc,
  take,
  compose,
  prop,
  propEq,
  find,
  map,
  pluck,
  path,
  reduce,
  values,
  filter,
  takeLast
} from "ramda";
import { WarpFactory } from "warp-contracts/web";
import Account from "arweave-account";

let prod = 'arweave.net'
if (import.meta.env.PROD) {
  prod = takeLast(2, globalThis.location.host.split(".")).join(".")
  if (prod === 'arweave.dev') {
    prod = 'arweave.net'
  }
}

let server = import.meta.env.DEV ? "arweave.net" : prod

const arweave = Arweave.init({
  host: server,
  port: 443,
  protocol: "https",
});

const account = new Account({
  cacheIsActivated: true,
  cacheSize: 100,
  cacheTime: 60,
});
const warp = WarpFactory.forMainnet();
const DRE = "https://dre-1.warp.cc";

export async function listAssets(count) {
  return (
    fetch(`https://${server}/graphql`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
query {
  transactions(first: 100, tags: [
    {name: "Type", values: ["image", "video", "pdf", "audio"]}
  ]) {
    edges {
      node {
        id
        tags {
          name
          value
        }
      }
    }
  }
}
      `,
      }),
    })
      .then((res) => res.json())
      .then(path(["data", "transactions", "edges"]))
      //.then(x => (console.log(x), x))
      .then(
        compose(
          take(count),
          filter((n) => n.title),
          map((node) => {
            return {
              id: prop("id", node),
              title: prop("value", find(propEq("name", "Title"), node.tags)),
            };
          }),
          filter(
            (node) =>
              prop("value", find(propEq("name", "Uploader"), node.tags)) !==
              "RedStone"
          ),

          pluck("node")
        )
      )
  );
}

export async function assetDetails(asset, addr) {
  // const state = await fetch('https://cache.permapages.app/' + asset)
  //   .then(res => res.ok ? res.json() : Promise.reject(new Error('could not find asset state!')))
  await warp.contract(asset).syncState(DRE + "/contract", { validity: true });
  const state = await warp
    .contract(asset)
    .setEvaluationOptions({ internalWrites: true, allowBigInt: true })
    .readState()
    .then(path(["cachedValue", "state"]));
  if (asset === "YyHY6_A7RyoVoKreIjld6DsbwvURhfBh0KFRNvlAgT0") {
    console.log("STATE: ", state);
  }
  try {
    const balances = state.balances;
    const totalBalance = reduce((a, b) => a + b, 0, values(balances));
    const addrBalance = balances[addr];
    const percentOwned = Math.floor((addrBalance / totalBalance) * 100);
    const a = await account.get(state.emergencyHaltWallet);

    return {
      percent: percentOwned,
      handle: "@" + a.profile.handleName,
    };
  } catch (e) {
    console.log(e);
  }
}

export async function transfer({ asset, title, caller, addr, percent }) {
  await warp.contract(asset).syncState(DRE + "/contract", { validity: true });
  const contract = warp
    .contract(asset)
    .connect("use_wallet")
    .setEvaluationOptions({
      internalWrites: true,
      allowBigInt: true,
    });

  const res = await contract.viewState({
    function: "balance",
  });

  if (res.type === "ok" && addr.length === 43) {
    if (res.result.balance > 0) {
      // calculate percent
      let bal = res.result.balance;
      let qty = Math.floor(bal * (percent / 100));

      await contract.writeInteraction(
        {
          function: "transfer",
          target: addr,
          qty,
        },
        {
          tags: [
            { name: "Transferred-From", value: caller },
            { name: "Transferred-To", value: addr },
            { name: "Transferred-Percent", value: percent },
            { name: "Title", value: title },
          ],
        }
      );

      const txCheck = await contract.viewState({
        function: "balance",
        target: addr,
      });

      if (txCheck.type === "ok") {
        if (txCheck.result.balance >= qty) {
          return { ok: true };
        }
      } else {
        return {
          ok: false,
          message: "Could not confirm balance transfer!",
        };
      }
    }
  } else {
    return {
      ok: false,
      message: `Could not get balance or "recipient address" ${addr} is not valid!`,
    };
  }

  return { ok: true };
}

export async function includeTransferred(addr) {
  // lxZ38bR9ABqIDINHuHlJI7o5aYQeJeSlYOz3UWBoMao
  return fetch(`https://${server}/graphql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `
query {
  transactions(first: 100, tags: {name: "Transferred-To", values: ["${addr}"]}) {
    edges {
      node {
        id
        tags {
          name 
          value
        }
      }
    }
  }
}
      `,
    }),
  })
    .then((res) =>
      res.ok
        ? res.json()
        : Promise.reject(new Error("ERROR: STATUS " + res.status))
    )
    .then(
      compose(
        map(txToAssetInfo),
        pluck("node"),
        path(["data", "transactions", "edges"])
      )
    );
}

export async function excludeTransferred(addr) {
  return fetch(`https://${server}/graphql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `
query {
  transactions(first: 100, tags: {name: "Transferred-From", values: ["${addr}"]}) {
    edges {
      node {
        id
        tags {
          name 
          value
        }
        block {
          timestamp
        }
      }
    }
  }
}
      `,
    }),
  })
    .then((res) =>
      res.ok
        ? res.json()
        : Promise.reject(new Error("ERROR: STATUS " + res.status))
    )
    .then(
      compose(
        map(txToAssetInfo),
        pluck("node"),
        path(["data", "transactions", "edges"])
      )
    )
    .then(
      reduce((data, asset) => {
        if (data[asset.id]) {
          data[asset.id] += Number(asset.percent);
        } else {
          data[asset.id] = Number(asset.percent);
        }
        return data;
      }, {})
    )
    .then((x) => (console.log("exclude", x), x));
}

export function pstsByOwner(addr) {
  return fetch(`https://contracts.warp.cc/balances?walletAddress=${addr}`)
    .then((res) => res.json())
    .then((result) => pluck("contract_tx_id", result.balances))
    .then(buildQuery)
    .then((gql) => arweave.api.post("graphql", gql)) // .then((res) => res.json()))
    .then(prop("data"))
    .then(({ data: { transactions: edges } }) => edges.edges)
    .then(pluck("node"))
    .then(map(transformTx));
}

export async function imagesByOwner(addr) {
  return fetch(`https://${server}/graphql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `
query {
  transactions(first: 100, owners: ["${addr}"], tags: {name: "Type", values: ["image", "video", "pdf", "audio"]}) {
    edges {
      node {
        id
        tags {
          name
          value
        }
        owner {
          address
        }
        block {
          timestamp
        }
      }
    }
  }
}    
    `,
    }),
  })
    .then((res) =>
      res.ok
        ? res.json()
        : Promise.reject(new Error("ERROR: STATUS " + res.status))
    )
    .then(
      compose(
        map(transformTx),
        pluck("node"),
        path(["data", "transactions", "edges"])
      )
    );
}

function fetchFromBundlr(id) {
  return fetch(`https://node2.bundlr.network/graphql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      query: `query {
      transactions (ids: ["${id}"]) {
        edges {
          node {
            id
            address
            tags {
              name
              value
            }   
            timestamp
        }
      }
      }
    }`})
  })
    .then((res) => res.json())
    .then(path(['data', 'transactions', 'edges', '0']))
    .then(({ node }) => {
      const tags = node.tags.reduce((a, v) => assoc(v.name, v.value, a), {})
      return ({
        title: tags.Title,
        description: tags.Description,
        type: tags.Type,
        topics: pluck('value', filter((t) => t.name.includes("Topic:"), node.tags)),
        owner: tags.Creator || node.address,
        timestamp: node.timestamp || null
      })
    })
    .catch(e => null)
}

function fetchFromArweave(id) {
  return fetch(`https://arweave.net/graphql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      query: `query {
      transactions (ids: ["${id}"]) {
        edges {
          node {
            id
            owner { address }
            tags {
              name
              value
            }
            block {   
              timestamp
            }
        }
      }
      }
    }`})
  })
    .then((res) => res.json())
    .then(path(['data', 'transactions', 'edges', '0']))
    .then(({ node }) => {
      const tags = node.tags.reduce((a, v) => assoc(v.name, v.value, a), {})
      return ({
        title: tags.Title,
        description: tags.Description,
        type: tags.Type,
        topics: pluck('value', filter((t) => t.name.includes("Topic:"), node.tags)),
        owner: tags.Creator || node.address,
        timestamp: node.block.timestamp || Date.now()
      })
    })
    .catch(e => null)
}

export async function getAssetData(id) {
  // if not found try to get for arweave.net/tx and it may be pending
  // so show loading dialog, until pending is resolved --tnw
  return Promise.all([fetchFromBundlr(id), fetchFromArweave(id)])
    .then(res => (console.log('results', res), res))
    .then(res => res[0] ? res[0] : res[1])
}

function query(id) {
  return `
query {
  transaction(id: "${id}") {
    id
    owner {
      address
    }
    tags {
      name
      value
    }
    block {
      timestamp
    }
  }
}
  
  `;
}

function transformTx(node) {
  return {
    id: node.id,
    title: prop("value", find(propEq("name", "Title"), node.tags)),
    type: prop("value", find(propEq("name", "Type"), node.tags)),
    description: prop("value", find(propEq("name", "Description"), node.tags)),
    owner: node.owner.address,
    timestamp: node?.block?.timestamp || Date.now() / 1000,
  };
}

function txToAssetInfo(node) {
  const getTag = (name) => prop("value", find(propEq("name", name), node.tags));

  return {
    id: getTag("Contract"),
    percent: getTag("Transferred-Percent"),
    owner: getTag("Transferred-To"),
    type: "image",
    description: "",
    title: getTag("Title") || "Unknown",
    timestamp: node?.block?.timestamp || Date.now() / 1000,
  };
}

function buildQuery(ids) {
  return {
    query: `query($ids: [ID!]!) {
        transactions(first: 100, ids: $ids, tags: {name: "Type", values: ["image", "pdf", "video"]}) {
          edges {
            node {
              id
              tags {
                name
                value
              }
              owner {
                address
              }
              block {
                timestamp
              }
            }
          }
        }
    }`,
    variables: {
      ids,
    },
  };
}
