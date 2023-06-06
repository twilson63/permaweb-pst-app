<script>
  import Navbar from "../components/navbar.svelte";
  import { getAssetData } from "../lib/asset.js";
  import { getTradeData } from "../lib/trade.js";
  import services from "../services/index.js";
  import { sell } from "../lib/trade.js";
  import { atomicToStamp } from "../lib/utils.js";
  import Construction from "../dialogs/construction.svelte";
  import Stamping from "../dialogs/stamping.svelte";
  import Processing from "../dialogs/processing.svelte";
  import ErrorDialog from "../dialogs/error.svelte";
  import ConnectModal from "../dialogs/connect.svelte";
  import WalletHelp from "../dialogs/wallet-help.svelte";
  import Sell from "../dialogs/sell.svelte";
  import Buy from "../dialogs/buy.svelte";
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

  const U = "rO8f4nTVarU6OtU2284C8-BIH6HscNd-srhWznUllTk";

  export let id;
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

  let address = "";
  onMount(async () => {
    const i = $imgCache.find((img) => img.id === id);

    if (i) {
      src = i.src;
      imageMsg =
        "Currently displaying cache, when deploying directly to arweave, it can take up to 30 minutes to show on chain...";
    } else {
      src = `https://arweave.net/${encodeURI(id)}`;
      //src = await loadImage(`https://arweave.net/${encodeURI(id)}/asset`);
      //console.log(src);
    }

    if (window.arweaveWallet) {
      address = await window.arweaveWallet.getActiveAddress();
    }
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
      "🪧 STAMP\n\n" + title.replace("#", "no ") + "\n\n🐘"
    )}&url=https://pst.arweave.dev/%23/show/${id}`;
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
    if (globalThis.arweaveWallet) {
      address = await globalThis.arweaveWallet.getActiveAddress();
    }
    const sumBalance = compose(
      reduce((acc, [k, v]) => acc + v, 0),
      toPairs
    );

    assetData = await getAssetData(id);

    // get trade info and append to assetData
    tradeData = await getTradeData({ readState: services.readState }, id)
      /*
      .map((balances) => {
        const units = sumBalance(balances);
        let owned = 0;
        if (address) {
          owned = balances[address];
        }
        return {
          totalBar: 0,
          percent: Math.floor((owned / units) * 100),
          units,
          owned: owned || 0,
          canPurchase: balances[id] || 0,
          sponsors: reject(equals(id), Object.keys(balances)).length,
          bar: 0.01,
        };
      })
      */

      .toPromise();

    assetData = {
      id,
      src,
      ...assetData,
      ...tradeData,
      user: address,
      u: 0.01,
      percent: 100,
    };

    return assetData;
  }

  async function listAsset() {
    console.log({ u: assetData.u });
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
      await new Promise((r) => setTimeout(r, 1000));
      showProcessing = false;
    } catch (e) {
      showProcessing = false;
      errorDlg = true;
      errorMsg = e.message;
    }
  }
</script>

<svelte:head>
  <title>pst</title>
  <meta property="og:image" content="{location.origin}/{id}" />
  <meta property="og:url" content="{location.origin}/#/show/{id}" />
</svelte:head>

<Navbar on:connect={() => (showConnect = true)} />
{#await getData(id) then asset}
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
            <img
              class="ml-4 h-[35px] w-[35px]"
              src="assets/stamp.svg"
              alt="stamp-logo"
            />
          </button>
        </div>
        <div class="w-[325px] md:w-1/2 px-0 mx-0 md:ml-8">
          <div class="mb-4 px-0 mx-0 flex items-start justify-between">
            <h1 class="text-3xl">{asset.title}</h1>
            <a
              target="_blank"
              href={tweetLink(asset.title, id)}
              class="btn btn-outline btn-sm rounded-none font-normal">share</a
            >
          </div>
          <div class="text-sm">Description</div>
          <p class="text-xl">{asset.description}</p>
          {#if asset.topics.length > 0}
            <p class="mt-4 text-sm">Topics: {asset.topics.join(", ")}</p>
          {/if}
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
                        {take(5, asset.owner) + "-" + takeLast(5, asset.owner)}
                      </div>
                    {:else}
                      <div>{creator.profile.handleName}</div>
                    {/if}
                  </div>
                {/await}
              </div>
              <div>
                <div class="mb-2 uppercase">Created</div>
                <div>
                  {format(fromUnixTime(asset.timestamp), "MMMM d, yyyy")}
                </div>
              </div>
            </div>
          </div>
          <div class="mt-8 space-y-4">
            <div class="flex justify-between">
              <div class="mb-4 flex flex-col">
                <div>STAMPS</div>
                <div class="flex space-x-4 items-center">
                  <svg
                    class="h-6 w-6"
                    viewBox="0 0 782 793"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M125.363 217.325C148.845 91.1243 192.697 62.9806 320.558 81.7426C474.033 22.4067 507.865 59.0045 567.676 123.705L568.647 124.755C663.569 162.132 710.816 186.68 691.755 292.597C757.459 413.981 731.681 441.73 686.315 490.565L685.202 491.763C657.767 662.899 612.641 704.111 474.56 693.735C349.344 758.359 282.327 754.087 182.939 625.009C65.9429 569.454 26.9578 525.303 72.4688 390.31C42.7353 319.504 33.3356 279.554 125.363 217.325Z"
                      fill="#242424"
                    />
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M316.115 35.0888C458.498 -19.0905 523.695 -16.2143 598.115 84.0888C726.825 127.589 756.734 172.333 739.615 286.089C807.526 413.275 784.883 450.021 733.115 509.089C687.548 730.788 624.379 756.72 488.615 742.589C325.188 836.377 258.167 791.667 151.615 660.589C9.45317 594.357 -22.4356 536.709 21.6153 390.589C-17.0311 305.36 -8.07755 260.866 83.1153 189.589C114.981 52.3902 158.717 9.09934 316.115 35.0888ZM584.562 103.716C514.89 9.92753 453.854 7.23813 320.558 57.8987C173.204 33.5972 132.259 74.0764 102.427 202.364C17.0533 269.013 8.67109 310.617 44.8512 390.31C3.61148 526.941 33.4653 580.844 166.555 642.774C266.308 765.34 329.052 807.146 482.05 719.449C609.149 732.662 668.288 708.414 710.947 501.114C759.411 445.882 780.609 411.523 717.032 292.597C733.059 186.23 705.058 144.391 584.562 103.716Z"
                      fill="#242424"
                    />
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M320.558 57.8987C453.854 7.23813 514.89 9.92753 584.562 103.716C705.058 144.391 733.059 186.23 717.032 292.597C780.609 411.523 759.411 445.882 710.947 501.114C668.288 708.414 609.149 732.662 482.05 719.449C329.052 807.146 266.308 765.34 166.555 642.774C33.4653 580.844 3.61148 526.941 44.8512 390.31C8.67109 310.617 17.0533 269.013 102.427 202.364C132.259 74.0764 173.204 33.5972 320.558 57.8987ZM320.558 81.7426C192.697 62.9806 148.845 91.1243 125.363 217.325C33.3356 279.554 42.7353 319.504 72.4688 390.31C26.9578 525.303 65.9429 569.454 182.939 625.009C282.327 754.087 349.344 758.359 474.56 693.735C612.641 704.111 657.767 662.899 685.202 491.763L686.315 490.565C731.681 441.73 757.459 413.981 691.755 292.597C710.816 186.68 663.569 162.132 568.647 124.755L567.676 123.705C507.865 59.0045 474.033 22.4067 320.558 81.7426Z"
                      fill="#F9F9F9"
                    />
                    <path
                      d="M216 420.075C192.804 420.075 181.666 438.54 203.336 446.814C231.925 457.73 287.19 467 392.348 467C494.783 467 608 453.246 608 423.513C608 391.077 503.52 388.417 413.814 386.134C346.336 384.416 287.217 382.911 287.217 369.105C287.217 353.733 340.591 349.283 396.661 349.283C423.254 349.283 448.149 350.284 466.975 353.322C489.875 357.017 520.056 372.341 543.252 372.341H561.802C584.526 372.341 597.668 352.919 576.728 344.09C541.084 329.06 472.619 324 396.661 324C264.035 324 181.009 339.574 181.009 366.88C181.009 403.045 287.933 404.913 378.833 406.5C446.04 407.674 504.487 408.695 504.487 423.311C504.487 435.042 458.122 441.11 391.809 441.11C364.402 441.11 338.953 440.203 319.559 437.57C296.05 434.379 263.258 420.075 239.534 420.075H216Z"
                      fill="white"
                    />
                  </svg>
                  {#await assetCount then count}
                    <div>{count}</div>
                  {/await}
                </div>
              </div>
              <!-- if owner, then trade, if not owner, buy -->
              <div>
                <div class="flex flex-col">
                  {#if asset.owner === address}
                    <button
                      class="btn btn-outline btn-sm rounded-none"
                      on:click={() => (showSell = true)}>Trade</button
                    >
                  {:else}
                    <button
                      disabled={asset.items.reduce(
                        (a, v) => (a ? v.type !== "order" : a),
                        true
                      )}
                      class="btn btn-outline btn-sm rounded-none"
                      on:click={() => (showBuy = true)}>Buy</button
                    >
                  {/if}
                </div>
              </div>
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
              Link: <a class="link" href="https://arweave.net/{id}"
                >{take(5, id)}...{takeLast(5, id)}</a
              >
            </div>
            <div class="hidden md:block">
              Link: <a class="link" href="https://arweave.net/{id}">{id}</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
  <Sell bind:open={showSell} bind:data={assetData} on:submit={listAsset} />
  <Buy bind:open={showBuy} bind:data={assetData} />
{:catch e}
  <div class="alert alert-error">
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
