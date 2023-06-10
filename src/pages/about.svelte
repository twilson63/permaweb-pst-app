<script>
  import Navbar from "../components/navbar.svelte";
  import { marked } from "marked";
  import ConnectModal from "../dialogs/connect.svelte";
  import WalletHelp from "../dialogs/wallet-help.svelte";

  let showConnect = false;
  let showHelp = false;
</script>

<Navbar on:connect={() => (showConnect = true)} />
<main>
  <section class="hero min-h-screen bg-base-100">
    <div class="hero-content flex-col">
      <div class="prose prose-xl">
        {@html marked.parse(`
# pst

\`pst\` is a decentrailized application that has been created to showcase Atomic Assets. An Atomic Asset is
a Tradeable PST (Profit Sharing Token), that can be STAMPed (https://stamps.g8way.io). The \`STAMP\` process gives viewers the ability to create a proof of 
attention. And by making the data tradeable, it allows the community to share in the rewards.
         
        `)}
      </div>
    </div>
  </section>
</main>
<ConnectModal bind:open={showConnect} on:help={() => (showHelp = true)} />
<WalletHelp bind:open={showHelp} />
