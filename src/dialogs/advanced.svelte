<script>
  import { createEventDispatcher } from "svelte";
  import Modal from "../components/modal.svelte";

  import { profile } from "../store.js";

  export let open;
  const dispatch = createEventDispatcher();
</script>

<Modal
  bind:open
  bgColor="bg-white"
  border="border-4 border-[#929292]"
  cancel={true}
  on:cancel={() => (open = false)}
>
  <div class="px-[36px] py-[24px] flex flex-col space-y-8">
    <h2 class="text-2xl font-bold text-[#160042]">Advanced Options</h2>
    <p class="text-xl  text-[#160042]">Create advanced options for your PST</p>
  </div>
</Modal>
