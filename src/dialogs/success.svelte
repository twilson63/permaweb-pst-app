<script>
    import Modal from "../components/modal.svelte";
  
    export let open = false;
  
  </script>
  
  <Modal {open} on:cancel={() => dispatch("cancel")}>
    <div
      class="m-4 border-4 border-success pb-8 px-2 flex flex-col items-center justify-center"
    >
      <h3 class="mb-8 text-3xl bg-success text-white p-2 mt-4">Success! You listed your PST, be sure to share!</h3>
      <button class="btn btn-sm btn-outline btn-info" on:click>Share</button>
    </div>
  </Modal>
  