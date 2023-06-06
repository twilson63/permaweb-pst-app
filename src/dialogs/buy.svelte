<script>
  import { createEventDispatcher } from "svelte";
  import Modal from "../components/modal.svelte";
  import Pie from "../components/pie-buy.svelte";
  import Asset from "../components/asset.svelte";

  export let open;

  export let data = {
    title: "Asset Title",
    percent: 0,
    bar: 0,
  };

  export let buyQty = 0;
  let percent = 0;

  const dispatch = createEventDispatcher();

  $: {
    let purchase = Math.floor(Number(buyQty) / Number(data.price));
    let remaining =
      Number(data.units) - Math.floor(Number(buyQty) / Number(data.price));
    percent = Math.floor((purchase / remaining) * 100);
  }

  function handleSubmit() {
    dispatch("submit");
  }
  function handleCancel() {
    open = false;
  }
</script>

<Modal {open} ok={false} width="w-11/12" maxWidth="max-w-5xl">
  <button
    on:click={() => (open = false)}
    class="btn btn-sm btn-circle absolute right-2 top-2">✕</button
  >

  <div class="flex space-x-8 flex-col md:flex-row space-y-8">
    <Asset asset={data}>
      <p class="w-full text-xs mt-8 mb-2"><em>Click to buy asset.</em></p>
      <button class="btn btn-outline btn-block">Buy Asset</button>
    </Asset>
    <div class="flex md:w-1/2 flex-col">
      <div class="flex justify-center">
        <div class="w-[250px]">
          <Pie items={data.items} />
        </div>
      </div>

      <div class="flex">
        <div class="form-control w-1/3">
          <label class="label" for="spend">I will spend...</label>
          <div class="relative">
            <input
              id="spend"
              type="text"
              class="input input-bordered w-full"
              bind:value={buyQty}
            />
          </div>
        </div>
        <div class="grid place-items-center mx-4">
          <svg
            width="13"
            height="13"
            viewBox="0 0 13 13"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6.5 0C5.21442 0 3.95772 0.381218 2.8888 1.09545C1.81988 1.80968 0.986756 2.82484 0.494786 4.01256C0.00281635 5.20028 -0.125905 6.50721 0.124899 7.76809C0.375703 9.02896 0.994767 10.1872 1.90381 11.0962C2.81285 12.0052 3.97104 12.6243 5.23192 12.8751C6.49279 13.1259 7.79973 12.9972 8.98744 12.5052C10.1752 12.0132 11.1903 11.1801 11.9046 10.1112C12.6188 9.04229 13 7.78558 13 6.5C12.9982 4.77665 12.3128 3.12441 11.0942 1.90582C9.87559 0.687224 8.22335 0.00181989 6.5 0ZM6.5 12C5.41221 12 4.34884 11.6774 3.44437 11.0731C2.5399 10.4687 1.83495 9.60975 1.41867 8.60476C1.00238 7.59977 0.893465 6.4939 1.10568 5.427C1.3179 4.36011 1.84173 3.3801 2.61092 2.61091C3.3801 1.84172 4.36011 1.3179 5.42701 1.10568C6.4939 0.893462 7.59977 1.00238 8.60476 1.41866C9.60976 1.83494 10.4687 2.53989 11.0731 3.44436C11.6774 4.34883 12 5.4122 12 6.5C11.9983 7.95818 11.4184 9.35617 10.3873 10.3873C9.35617 11.4184 7.95819 11.9983 6.5 12ZM9.35375 6.14625C9.40024 6.19269 9.43712 6.24783 9.46228 6.30853C9.48745 6.36923 9.5004 6.43429 9.5004 6.5C9.5004 6.56571 9.48745 6.63077 9.46228 6.69147C9.43712 6.75217 9.40024 6.80731 9.35375 6.85375L7.35375 8.85375C7.25993 8.94757 7.13268 9.00028 7 9.00028C6.86732 9.00028 6.74007 8.94757 6.64625 8.85375C6.55243 8.75993 6.49972 8.63268 6.49972 8.5C6.49972 8.36732 6.55243 8.24007 6.64625 8.14625L7.79313 7H4C3.86739 7 3.74022 6.94732 3.64645 6.85355C3.55268 6.75979 3.5 6.63261 3.5 6.5C3.5 6.36739 3.55268 6.24021 3.64645 6.14645C3.74022 6.05268 3.86739 6 4 6H7.79313L6.64625 4.85375C6.55243 4.75993 6.49972 4.63268 6.49972 4.5C6.49972 4.36732 6.55243 4.24007 6.64625 4.14625C6.74007 4.05243 6.86732 3.99972 7 3.99972C7.13268 3.99972 7.25993 4.05243 7.35375 4.14625L9.35375 6.14625Z"
              fill="black"
            />
          </svg>
        </div>
        <div class="form-control w-1/3">
          <label class="label" for="percent">I will receive...</label>
          <div class="relative">
            <input
              id="percent"
              type="text"
              class="input input-bordered w-full"
              bind:value={percent}
              readonly
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</Modal>
