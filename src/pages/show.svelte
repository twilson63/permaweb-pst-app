<script>
  import Navbar from "../components/navbar.svelte";
  import { getAssetData } from "../lib/asset.js";
  //import { getTradeData, getBalance, sell, buy } from "../lib/trade.js";
  import services from "../services/index.js";
  import { atomicToStamp } from "../lib/utils.js";
  import Construction from "../dialogs/construction.svelte";
  import Stamping from "../dialogs/stamping.svelte";
  import Processing from "../dialogs/processing.svelte";
  import ErrorDialog from "../dialogs/error.svelte";
  import ConnectModal from "../dialogs/connect.svelte";
  import WalletHelp from "../dialogs/wallet-help.svelte";

  import stampSvg from "../assets/stamp.svg";
  import {
    compose,
    take,
    takeLast,
    split,
    join,
    equals,
    always,
    identity,
    cond,
    T,
    reduce,
    toPairs,
    reject,
  } from "ramda";
  import { format, fromUnixTime } from "date-fns";

  import { onMount } from "svelte";
  import { imgCache, profile } from "../store.js";
  import { stamp, getCount } from "../lib/stamp.js";
  import { getProfile } from "../lib/account.js";
  import { ArweaveWebWallet } from "arweave-wallet-connector";
  import { router } from "tinro";
  import { getPromo } from "../lib/promos.js";
  import SuccessDlg from "../dialogs/success.svelte";
  import Loading from "../dialogs/loading.svelte";

  const U = __BAR_CONTRACT__;
  const wallet = new ArweaveWebWallet();
  wallet.setUrl("arweave.app");

  export let id;
  let server = import.meta.env.DEV
    ? "https://arweave.net"
    : `https://${takeLast(2, globalThis.location.host.split(".")).join(".")}`;

  let src = "https://placehold.co/400";
  let imageMsg = "";
  let stampDlg = false;
  let errorDlg = false;
  let errorMsg = "";
  let showConnect = false;
  let showHelp = false;
  let tryingToStamp = false;
  let showBuy = false;
  let showSell = false;
  let showProcessing = false;
  let showSuccess = false;
  let showLoading = false;

  let address = "";
  onMount(async () => {
    const i = $imgCache.find((img) => img.id === id);

    if (i) {
      src = i.src;
      imageMsg =
        "Currently displaying cache, when deploying directly to arweave, it can take up to 30 minutes to show on chain...";
    } else {
      src = `${server}/${encodeURI(id)}`;
      //src = await loadImage(`https://arweave.net/${encodeURI(id)}/asset`);
      //console.log(src);
    }

    if (window.arweaveWallet) {
      await window.arweaveWallet.connect(
        ["ACCESS_ADDRESS", "SIGN_TRANSACTION", "DISPATCH"],
        { name: "Atomic Asset Creator" }
      );
      address = await window.arweaveWallet.getActiveAddress();
      if (!address) {
        await wallet.connect();
        address = wallet.address;
      }
    }
    //console.log({ address });
  });

  let constructionDlg = false;
  let msg = "";

  function loadImage(url) {
    return new Promise((resolve) => {
      fetch(url)
        // Extract as a blob
        .then((resp) => resp.blob())
        .then((blob) => {
          console.log("got blob");
          // Image element to load the image into. Could be passed as a variable if you already have an element to load into.
          const img = document.createElement("img");
          // Use blob as object url
          //img.src = URL.createObjectURL(blob);

          // wait for image to be loaded before resolving the promise
          // img.onload = () => {
          //   console.log("loaded");
          //   resolve(img.src);
          // };
          resolve(URL.createObjectURL(blob));
        });
    });
  }

  async function handleStamp() {
    if (!window.arweaveWallet) {
      tryingToStamp = true;
      showConnect = true;
      return;
    }
    tryingToStamp = false;
    stampDlg = true;

    stamp(id)
      .then((res) => {
        assetCount = getCount(id);
        stampDlg = false;
      })
      .catch((e) => {
        stampDlg = false;
        errorMsg = e.message;
        errorDlg = true;
      });
  }

  function tweetLink(title, id) {
    return `https://twitter.com/intent/tweet?text=${encodeURI(
      getPromo() + "\n\n" + title.replace("#", "no ") + "\n\n🐘"
    )}&url=https://${globalThis.location.host}/%23/show/${id}`;
  }

  function connected() {
    if (tryingToStamp) {
      handleStamp();
    }
  }

  function getHost() {
    return compose(
      cond([
        [equals("gitpod.io"), always("arweave.net")],
        [equals("arweave.dev"), always("arweave.net")],
        [equals("localhost"), always("arweave.net")],
        [T, identity],
      ]),
      join("."),
      takeLast(2),
      split(".")
    )(location.hostname);
  }

  let assetCount = getCount(id);
  let assetData = getAssetData(id);
  let tradeData = {};

  async function getData(id) {
    showLoading = true;
    if (globalThis.arweaveWallet) {
      address = await arweaveWallet.getActiveAddress();
    }
    // const sumBalance = compose(
    //   reduce((acc, [k, v]) => acc + v, 0),
    //   toPairs
    // );

    assetData = await getAssetData(id);

    // get trade info and append to assetData
    /*
    tradeData = await getTradeData(
      { readState: services.readState },
      id
    ).toPromise();
    */
    assetData = {
      id,
      src,
      ...assetData,
      //...tradeData,
      sponsors: [],
      // tradeData.items
      //   .filter((item) => item.type === "sponsor")
      //   .map((_) => 1)
      //   .reduce((a, b) => a + b, 0),
      user: address,
      // u: tradeData.price / 1e6,
      u: 0,
      percent: 100,
    };

    showLoading = false;
    return assetData;
  }

  /*
  async function purchaseAsset() {
    let address;
    if (window.arweaveWallet) {
      await window.arweaveWallet.connect(
        ["ACCESS_ADDRESS", "SIGN_TRANSACTION", "DISPATCH"],
        { name: "PST" }
      );
      address = await window.arweaveWallet.getActiveAddress();
    } else {
      await wallet.connect();
      address = wallet.address;
    }
    let purchasePrice = 0;
    try {
      purchasePrice =
        assetData.items.find((i) => i.type === "order")?.price || 0;

      const uBalance = await getBalance(services, U, address).toPromise();
      if (uBalance < purchasePrice) {
        showBuy = false;
        errorDlg = true;
        errorMsg = "Not enough U to purchase!" + "\n\n";
        return;
      }

      showBuy = false;
      showProcessing = true;
    } catch (e) {
      showProcessing = false;
      errorDlg = true;
      errorMsg = e.message + "\n\n";
      return;
    }

    try {
      const result = await buy(
        { ...services, RebAR: U },
        assetData.id,
        purchasePrice
      ).toPromise();
      showProcessing = false;
      // Do tweet on purchase
    } catch (e) {
      showProcessing = false;
      errorDlg = true;
      errorMsg = e.message + "\n\n";
    }
  }

  async function listAsset() {
    if (!Number.isInteger(Number(assetData.u) * 1e6)) {
      alert("Price must be a number!");
      return;
    }
    showSell = false;
    showProcessing = true;
    try {
      const result = await sell(
        { ...services, RebAR: U },
        assetData.id,
        assetData.percent,
        Number(assetData.u)
      ).toPromise();

      showProcessing = false;
      showSuccess = true;
    } catch (e) {
      showProcessing = false;
      errorDlg = true;
      errorMsg = e.message;
    }
  }
  */
</script>

<svelte:head>
  <title>Atomic Asset Creator</title>
  <meta property="og:image" content="{location.origin}/{id}" />
  <meta property="og:url" content="{location.origin}/#/show/{id}" />
</svelte:head>

<Navbar on:connect={() => (showConnect = true)} />
{#await getData(id)}
  <Loading bind:open={showLoading} />
{:then asset}
  <main>
    <section class="hero min-h-screen bg-base-100">
      <div
        class="hero-content w-[350px] md:w-full p-0 m-0 flex-col md:flex-row md:space-x-4"
      >
        <div class="md:w-1/2 px-0 mx-0 grid place-items-center">
          {#if asset.renderWith}
            <iframe
              src={`https://${getHost()}/${asset.renderWith}/?tx=${id}`}
              class="h-[400px] w-full md:w-[660px] object-contain"
            />
          {:else if asset.type === "image"}
            <img
              class="h-[400px] w-full md:w-[500px] object-contain"
              {src}
              alt={asset.title}
            />
          {:else if asset.type === "video"}
            <video
              controls
              class="h-[400px] w-full md:w-[500px] object-contain"
            >
              <source {src} />
            </video>
          {:else if asset.type === "audio"}
            <iframe
              src={`https://${getHost()}/f6I-Do04BO2pJysbiYIFjq4NkmjT5iYYWfF6cO-N4mc/?tx=${id}`}
              class="h-[400px] w-full md:w-[660px] object-contain"
            />
          {:else}
            <iframe
              {src}
              class="h-[400px] w-full md:w-[500px] object-contain"
            />
          {/if}
          {#if imageMsg !== ""}
            <p>{imageMsg}</p>
          {/if}
          <button
            on:click={handleStamp}
            class="mt-4 btn btn-block rounded-none"
          >
            <span class="text-xl font-normal">STAMP</span>
            <img class="ml-4 h-8 w-8" src={stampSvg} alt="stamp-logo" />
          </button>
        </div>
        <div class="w-[325px] md:w-1/2 px-0 mx-0 md:ml-8">
          <div class="mb-4 px-0 mx-0 flex items-start justify-between">
            <h1 class="text-3xl">{asset.title}</h1>
            <div class="flex space-x-2">
              <a
                target="_blank"
                href={tweetLink(asset.title, id)}
                class="btn btn-outline btn-sm rounded-none font-normal">share</a
              >
              <a
                target="_blank"
                href={`https://bazar.arweave.dev/#/asset/${id}`}
                class="btn btn-outline btn-sm rounded-none font-normal">BazAR</a
              >
            </div>
          </div>
          <div class="text-sm">Description</div>
          <p class="text-xl">{asset.description}</p>
          {#if asset.topics.length > 0 && asset.topics[0].length > 0}
            <p class="mt-4 text-sm">Topics: {asset.topics.join(", ")}</p>
          {/if}
          <!-- <div class="mt-4">
            <div class="flex justify-between">
              <div>
                <div class="mb-2 uppercase">Owners</div>
                {#each asset.items.filter((i) => i.type === "sponsor") as sponsor}
                  {#if Number(sponsor.percent) > 2}
                    {#await getProfile(sponsor.id) then profile}
                      <div class="flex items-center space-x-2">
                        <img
                          class="mask mask-circle h-[35px] w-[35px]"
                          src={profile.profile.avatarURL}
                          alt="avatar"
                        />

                        {#if profile.profile.handleName === ""}
                          <div>
                            <a class="link" href="/psts/{sponsor.id}"
                              >{take(5, sponsor.id) +
                                "-" +
                                takeLast(5, sponsor.id)}</a
                            >
                          </div>
                        {:else}
                          <div>
                            <a class="link" href="/psts/{sponsor.id}"
                              >{profile.profile.handleName}</a
                            >
                          </div>
                        {/if}
                      </div>
                    {/await}
                  {/if}
                {/each}
              </div>
            </div>
          </div> -->
          <div class="mt-4">
            <div class="flex justify-between">
              <div>
                <div class="mb-2 uppercase">Creator</div>
                {#await getProfile(asset.owner) then creator}
                  <div class="flex items-center space-x-2">
                    <img
                      class="mask mask-circle h-[35px] w-[35px]"
                      src={creator.profile.avatarURL}
                      alt="avatar"
                    />
                    {#if creator.profile.handleName === ""}
                      <div>
                        <a class="link" href="/psts/{asset.owner}"
                          >{take(5, asset.owner) +
                            "-" +
                            takeLast(5, asset.owner)}</a
                        >
                      </div>
                    {:else}
                      <div>
                        <a class="link" href="/psts/{asset.owner}"
                          >{creator.profile.handleName}</a
                        >
                      </div>
                    {/if}
                  </div>
                {/await}
              </div>
              <div>
                <div class="mb-2 uppercase">Created</div>
                <div>
                  {format(asset.timestamp, "MMMM d, yyyy")}
                </div>
              </div>
            </div>
          </div>
          <div class="mt-8 space-y-4">
            <div class="flex justify-between">
              <div class="mb-4 flex flex-col">
                <div>STAMPS</div>
                <div class="flex space-x-4 items-center">
                  <img class="h-6 w-6" alt="stamp logo" src={stampSvg} />
                  {#await assetCount then count}
                    <div>{count}</div>
                  {/await}
                </div>
              </div>
              <!-- if owner, then trade, if not owner, buy -->
              <!-- <div>
                <div class="flex flex-col">
                  {#if asset.items?.find((i) => i.type === "sponsor" && i.id === address && i.percent > 0)}
                    <button
                      class="btn btn-outline btn-sm rounded-none"
                      on:click={() => (showSell = true)}>Trade</button
                    >
                  {:else if asset.items.find((i) => i.type === "order")}
                    <button
                      class="btn btn-outline btn-sm rounded-none"
                      on:click={() => (showBuy = true)}>Buy</button
                    >
                  {:else}
                    <div class="border-2 px-2">Not for Sale</div>
                  {/if}
                </div>
              </div> -->
              <!-- <div>
                <div class="flex flex-col">
                  <div class="uppercase">Rewards</div>
                  <div class="flex space-x-4">
                    <div class="font-bold">$TAMP</div>
                    {#await getRewards(id) then rewards}
                      <div>{Number(atomicToStamp(rewards)).toFixed(5)}</div>
                    {/await}
                  </div>
                </div>
              </div> -->
            </div>
            <div class="md:hidden">
              Link: <a class="link" href="{server}/{id}" target="_blank"
                >{take(5, id)}...{takeLast(5, id)}</a
              >
            </div>
            <div class="hidden md:block">
              Link: <a class="link" href="{server}/{id}" target="_blank">{id}</a
              >
            </div>
            <div class="hidden md:block">
              see: <a
                class="link"
                href="https://viewblock.io/arweave/tx/{id}"
                target="_blank">viewblock</a
              >
            </div>
            <div class="hidden md:block">
              see: <a
                class="link"
                href="https://sonar.warp.cc/#/app/contract/{id}"
                target="_blank">sonar</a
              >
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
  <!-- <Sell bind:open={showSell} bind:data={assetData} on:submit={listAsset} />
  <Buy bind:open={showBuy} bind:data={assetData} on:click={purchaseAsset} /> -->
  <SuccessDlg
    bind:open={showSuccess}
    on:click={() => {
      globalThis.location.href = tweetLink(assetData.title, id);
      showSuccess = false;
    }}
  />
{:catch e}
  <div class="alert alert-error flex-col">
    <p class="mb-8">
      Looks there was an error trying to access this asset. It can take a few
      minutes to register on the index.
    </p>
    <h2 class="text-3xl">{e.message}</h2>
  </div>
{/await}
<Construction
  open={constructionDlg}
  {msg}
  on:cancel={() => (constructionDlg = false)}
/>
<Stamping bind:open={stampDlg} />
<ErrorDialog bind:open={errorDlg} msg={errorMsg} />
<ConnectModal
  bind:open={showConnect}
  on:connected={connected}
  on:help={() => (showHelp = true)}
/>
<WalletHelp bind:open={showHelp} />
<Processing bind:open={showProcessing} />
