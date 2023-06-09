<script>
  import { router } from "tinro";
  import U from "../assets/u.svg";
  //import { listAssets } from "../lib/asset.js";

  import ConnectModal from "../dialogs/connect.svelte";
  import WalletHelp from "../dialogs/wallet-help.svelte";
  let showConnect = false;
  let showWalletHelp = false;
</script>

<main>
  <section class="hero min-h-screen bg-base-100">
    <div class="hero-content flex-col space-y-8">
      <h1 class="text-8xl font-bold hover:text-primary">pst</h1>
      <p class="text-2xl dark:text-white">Trade on the Permaweb</p>
      <div class="flex space-x-4">
        <button class="btn rounded-none" on:click={() => (showConnect = true)}
          >Sell PSTs</button
        >
      </div>
      <!-- <div class="flex space-x-4">
        <button class="btn btn-primary" on:click={() => (showConnect = true)}
          >Connect Wallet</button
        >
        <a href="/about" class="btn btn-outline">Learn More</a>
      </div> -->
      <div class="w-full">
        <h3 class="text-xl text-center">Eye Blob Sale!</h3>
        <div class="flex items-center justify-center">
          <img
            class="h-32 w-32"
            src="https://g8way.io/MFJ8CkCF1LFttyYpSmQmmD71o28B5WOzaSY-uceo02s"
          />
          <div class="flex flex-col space-y-4">
            <div class="flex space-x-2">
              <span class="font-mono">Price: 0.01</span>
              <img src={U} class="h-6 w-6" />
            </div>
            <a
              href="/show/MFJ8CkCF1LFttyYpSmQmmD71o28B5WOzaSY-uceo02s"
              class="btn btn-sm btn-outline rounded-none">BUY</a
            >
          </div>
        </div>
        <div class="flex items-center justify-center">
          <img
            class="h-32 w-32"
            src="https://g8way.io/G8dxN3mWwtriEYWfU9nZx9fAef51cDlirWQ8caOYwhs"
          />
          <div class="flex flex-col space-y-4">
            <div class="flex space-x-2">
              <span class="font-mono">Price: 0.01</span>
              <img src={U} class="h-6 w-6" />
            </div>
            <a
              href="/show/G8dxN3mWwtriEYWfU9nZx9fAef51cDlirWQ8caOYwhs"
              class="btn btn-sm btn-outline rounded-none">BUY</a
            >
          </div>
        </div>
        <div class="flex items-center justify-center">
          <img
            class="h-32 w-32"
            src="https://g8way.io/Qmezzndh7qbSXFhmS0TuU34uYzJ-dRJ3Ie-rFwYYS4E"
          />
          <div class="flex flex-col space-y-4">
            <div class="flex space-x-2">
              <span class="font-mono">Price: 1.00</span>
              <img src={U} class="h-6 w-6" />
            </div>
            <a
              href="/show/Qmezzndh7qbSXFhmS0TuU34uYzJ-dRJ3Ie-rFwYYS4E"
              class="btn btn-sm btn-outline rounded-none">BUY</a
            >
          </div>
        </div>
      </div>
      <!-- {#await listAssets(9) then imgs}
        <div class="w-full grid gap-4 grid-cols-3 grid-flow-row">
          {#each imgs as img}
            <div>
              <a href="/show/{img.id}">
                <img
                  class="h-[100px] w-[128px]"
                  src="https://arweave.net/{img.id}"
                  alt={img.title}
                  onerror="this.src = 'assets/pst.svg'"
                />
              </a>
            </div>
          {/each}
        </div>
      {/await} -->
    </div>
  </section>
</main>
<ConnectModal
  bind:open={showConnect}
  on:connected={() => router.goto("/home")}
  on:help={() => (showWalletHelp = true)}
/>
<WalletHelp bind:open={showWalletHelp} />
