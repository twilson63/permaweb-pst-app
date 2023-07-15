<script>
  import { onMount } from "svelte";
  import { ArweaveWebWallet } from "arweave-wallet-connector";
  import Infotip from "../components/info-tip.svelte";
  import { providers } from "ethers";
  import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
  import { imgCache } from "../store.js";
  import { deploy, deployAr } from "../lib/deploy.js";

  import { profile } from "../store.js";
  import DeployDialog from "../dialogs/deploy.svelte";
  import ErrorDialog from "../dialogs/error.svelte";
  import ConfirmDialog from "../dialogs/confirm.svelte";
  import Navbar from "../components/navbar.svelte";
  import ConnectModal from "../dialogs/connect.svelte";
  import WalletHelp from "../dialogs/wallet-help.svelte";
  import { getAssetData } from "../lib/asset.js";

  //import { WebBundlr } from "@bundlr-network/client";
  const WebBundlr = Bundlr.default;

  let showConnect = false;
  let showHelp = false;
  let connected = false;
  let files = [];
  let title = "";
  let description = "";
  let topics = "";
  let deployDlg = false;
  let errorMessage = "";
  let errorDlg = false;
  let confirmDlg = false;
  let tx = "";
  let currency = "";
  let forkTX = "";
  let audioRenderer = false;
  let renderWith = "";
  let thumbnail = "";
  let sellChecked = false;
  let licenseTip = `choose a license for your atomic asset
  Default Public Use - allows anyone to copy and distribue
  Commercial Use - requires users to pay for commercial use
  Derivative Works - allow but users must credit source`;
  let license = "";
  let payment = "0.01";

  onMount(async () => {
    try {
      await new Promise((r) => setTimeout(r, 500));
      if (window.arweaveWallet) {
        await window.arweaveWallet.connect(
          ["ACCESS_ADDRESS", "SIGN_TRANSACTION", "DISPATCH"],
          { name: "Atomic Asset Creator" }
        );
        const addr = await window.arweaveWallet.getActiveAddress();
        $profile = { addr };
      } else {
        const wallet = new ArweaveWebWallet({
          name: "Atomic Asset Creator",
        });
        wallet.setUrl("arweave.app");
        await wallet.connect();
        const addr = wallet.address;
        console.log("address", addr);
        $profile = { addr };
      }
    } catch (e) {
      console.log(e);
    }
  });

  function showError(msg) {
    errorMessage = msg;
    errorDlg = true;
  }

  async function doDeploy(e) {
    const asset = {
      file: files[0],
      forkTX,
      title,
      description,
      topics,
      audioRenderer,
      thumbnail,
      licenseType: license,
      payment: payment,
      renderWith,
    };

    if (currency === "matic") {
      if (!window.ethereum) {
        showError("Metamask is required!");
        return;
      }
      try {
        deployDlg = true;

        await window.ethereum.enable();
        const provider = new providers.Web3Provider(window.ethereum);
        await provider._ready();

        const bundlr = new WebBundlr(
          "https://node2.bundlr.network",
          "matic",
          provider
        );

        await bundlr.ready();

        // fund account
        const price = await bundlr.getPrice(files[0].size);
        const balance = await bundlr.getLoadedBalance();

        if (balance.isLessThan(price)) {
          await bundlr.fund(price.minus(balance).multipliedBy(1.1).toFixed(0));
        }
        const result = await deploy(bundlr, asset);

        // reset form
        document.forms[0].reset();

        $imgCache = [
          ...$imgCache,
          { id: result.id, src: URL.createObjectURL(files[0]) },
        ];
        tx = result.id;

        files = [];
        deployDlg = false;
        confirmDlg = true;
      } catch (e) {
        console.log(e);
        deployDlg = false;
        errorMessage = e.message;
        errorDlg = true;
      }
    } else if (currency === "sol") {
      if (!window.solana) {
        showError("Phantom Wallet is required!");
        return;
      }
      try {
        deployDlg = true;
        await window.solana.connect();
        const provider = new PhantomWalletAdapter();
        await provider.connect();

        const bundlr = new WebBundlr(
          "https://node2.bundlr.network",
          "solana",
          provider
        );
        await bundlr.ready();
        // fund account
        const price = await bundlr.getPrice(files[0].size);
        const balance = await bundlr.getLoadedBalance();

        if (balance.isLessThan(price)) {
          await bundlr.fund(price.minus(balance).multipliedBy(1.1).toFixed(0));
        }

        const result = await deploy(bundlr, asset);

        // reset form
        document.forms[0].reset();

        $imgCache = [
          ...$imgCache,
          { id: result.id, src: URL.createObjectURL(files[0]) },
        ];
        tx = result.id;
        files = [];
        deployDlg = false;
        confirmDlg = true;
      } catch (e) {
        //console.log(e);
        deployDlg = false;
        showError("Could not upload using SOL, check your SOL balance.");
      }
    } else {
      if (!window.arweaveWallet) {
        errorMessage = "Arweave Wallet not found!";
        errorDlg = true;
        return;
      }

      // connnect
      await arweaveWallet.connect([
        "ACCESS_ADDRESS",
        "SIGN_TRANSACTION",
        "DISPATCH",
      ]);

      try {
        deployDlg = true;
        const result = await deployAr(asset);

        //await new Promise((r) => setTimeout(r, 30 * 1000));

        e.target.reset();

        tx = result.id;
        $imgCache = [
          ...$imgCache,
          { id: tx, src: URL.createObjectURL(files[0]) },
        ];
        tx = result.id;
        files = [];

        // check and see if it is available on graphql
        let found = false;
        let loopCount = 0;
        while (!found) {
          const result = await getAssetData(tx);
          if (result) {
            found = true;
          } else {
            await new Promise((r) => setTimeout(r, 15 * 1000));
          }
          loopCount++;
        }

        deployDlg = false;
        confirmDlg = true;
      } catch (e) {
        deployDlg = false;
        errorMessage = e.message;
        errorDlg = true;
      }
    }
  }

  $: notValid = !(
    files.length > 0 &&
    ["matic", "sol", "ar", "near"].includes(currency) &&
    title !== ""
  );
</script>

<Navbar on:connect={() => (showConnect = true)} />
<main>
  <section class="hero min-h-screen bg-base-100 items-start">
    <div class="flex flex-col items-center justify-start">
      <p>Upload</p>
      <form class="form mt-16 px-4 md:px-0" on:submit|preventDefault={doDeploy}>
        <div class="flex flex-col md:flex-row md:space-x-16 justify-center">
          <div>
            {#if files[0]}
              {#if files[0].type.split("/")[0] === "video"}
                <video
                  controls
                  class="border-2 border-secondary w-full md:w-[500px] md:h-[350px]"
                >
                  <source src={URL.createObjectURL(files[0])} />
                </video>
                <div class="mt-2 flex justify-end">
                  <button on:click={() => (files = [])} class="link">
                    clear
                  </button>
                </div>
              {:else if files[0].type.split("/")[0] === "image"}
                <img
                  class="border-2 border-secondary w-full md:w-[500px] md:h-[350px] object-contain"
                  src={URL.createObjectURL(files[0])}
                />
                <div class="mt-2 flex justify-end">
                  <button on:click={() => (files = [])} class="link"
                    >clear</button
                  >
                </div>
              {:else}
                <iframe
                  class="border-2 border-secondary w-full md:w-[500px] md:h-[350px] object-contain"
                  src={URL.createObjectURL(files[0])}
                />
                <div class="mt-2 flex justify-end">
                  <button on:click={() => (files = [])} class="link">
                    clear
                  </button>
                </div>
              {/if}
            {:else}
              <div class="form-control">
                <label
                  for="file"
                  class="bg-gray-200 h-[200px] md:h-[350px] w-full md:w-[500px] grid place-items-center rounded-xl hover:shadow-xl"
                >
                  <div>
                    <span class="text-gray-400">Select Media</span>
                    <img src="assets/image.svg" alt="image-icon" />
                  </div>
                </label>
                <input
                  id="file"
                  type="file"
                  class="hidden input input-bordered"
                  bind:files
                  accept="image/png, image/jpeg, image/gif, image/jpg, image/webp, image/svg+xml, application/pdf, audio/basic, audio/mp4, audio/mpeg, audio/ogg, video/avi, video/mpeg, video/mp4, video/ogg, video/quicktime"
                  required
                />
                <p
                  class="py-8 w-full md:w-[500px] bg-whitesmoke-200 text-gray-500 text-sm"
                >
                  When uploading images, it is important to note that you are
                  storing these images on a permanent blockchain and by
                  uploading you are indicating that you have permission to do
                  so. NSFW content is not permitted on this service.
                </p>
              </div>
            {/if}
            <div class="form-control">
              <label for="title" class="label" required>Title *</label>
              <input
                id="title"
                class="input input-bordered"
                bind:value={title}
                required
              />
            </div>
            <div class="form-control">
              <label for="desc" class="label">Description *</label>
              <textarea
                id="desc"
                class="textarea textarea-bordered"
                bind:value={description}
              />
            </div>

            <!-- <div class="form-control">
              <label for="thumbnail" class="label">Thumbnail (TX_ID)</label>
              <input
                type="text"
                id="thumbnail"
                class="textarea textarea-bordered"
                bind:value={thumbnail}
              />
            </div> -->
            <div class="form-control">
              <label for="topics" class="label">Topics</label>
              <input
                id="topics"
                class="input input-bordered"
                bind:value={topics}
              />
              <label class="label text-sm text-gray-400"
                >Enter a comma-separated list topics (e.g. collection, category,
                etc)</label
              >
            </div>
          </div>
          <div>
            <div class="form-control">
              <label for="currency" class="label">Currency *</label>
              <select class="select select-bordered" bind:value={currency}>
                <option value="none">Choose</option>
                <option value="sol">$SOL</option>
                <option value="matic">$MATIC</option>
                <option value="ar">$AR</option>
                <!--
                <option value="near">$near</option>
                -->
              </select>
              <label class="label text-sm text-gray-400"
                >(when using $AR you also mint $U)</label
              >
            </div>
            <div class="form-control">
              <label for="license" class="label"
                >License <Infotip tip={licenseTip} /></label
              >
              <select class="select select-bordered" bind:value={license}>
                <option value="default">Choose License</option>
                <option value="default">UDL Default Public Use</option>

                <option value="commercial"
                  >UDL Commercial Use - One Time Payment</option
                >
                <option value="derivative"
                  >UDL Derivative Works - Allow with Credit</option
                >
                <!--
                <option value="advanced">Advanced License</option>
                -->
              </select>
            </div>
            {#if license === "commercial"}
              <div class="form-control">
                <label for="payment" class="label">Payment</label>
                <input
                  bind:value={payment}
                  type="text"
                  id="payment"
                  class="input input-bordered"
                />
              </div>
            {/if}
            {#if license === "advanced"}
              <div class="form-control mt-2">
                <input
                  type="text"
                  id="key"
                  class="input input-bordered"
                  placeholder="key"
                />
              </div>
              <div class="form-control">
                <input
                  type="text"
                  id="key"
                  class="input input-bordered"
                  placeholder="value"
                />
              </div>
              <button class="btn btn-block mt-2">Add Tag</button>
            {/if}
            <!--
            <div class="form-control">
              <label for="fork" class="label">Forks (optional)</label>
              <input
                type="text"
                class="input input-bordered"
                bind:value={forkTX}
              />
            </div>
            -->
            {#if files[0] && files[0].type && files[0].type.split("/")[0] === "audio"}
              <div class="form-control">
                <label class="label">
                  <input
                    type="checkbox"
                    class="checkbox"
                    bind:value={audioRenderer}
                  />
                  Include Audio Renderer
                </label>
              </div>
            {/if}
            <div class="form-control">
              <label for="renderWith" class="label"
                >Render With <Infotip
                  tip={"A Renderer is a presentation control for your Atomic Asset"}
                /></label
              >
              <input
                id="renderWith"
                class="input input-bordered"
                placeholder="TX ID or ArNS Name for renderer "
                bind:value={renderWith}
              />
            </div>
            <div class="my-8 space-y-4">
              <button disabled={notValid} class="btn btn-block">Deploy</button>
            </div>
          </div>
        </div>
      </form>
    </div>
  </section>
</main>
<DeployDialog open={deployDlg} />
<ErrorDialog
  open={errorDlg}
  msg={errorMessage}
  on:cancel={() => (errorDlg = false)}
/>
<ConfirmDialog {tx} open={confirmDlg} on:cancel={() => (confirmDlg = false)} />
<ConnectModal
  bind:open={showConnect}
  on:connected={connected}
  on:help={() => (showHelp = true)}
/>
<WalletHelp bind:open={showHelp} />
