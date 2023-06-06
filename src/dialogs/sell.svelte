<script>
  import { createEventDispatcher } from "svelte";
  import Modal from "../components/modal.svelte";
  import Pie from "../components/pie-sell.svelte";
  import Asset from "../components/asset.svelte";

  export let open;

  export let data = {
    title: "Asset Title",
    items: [],
    price: 0,
  };

  const dispatch = createEventDispatcher();

  function handleSubmit() {
    dispatch("submit");
  }

  function handleCancel() {
    open = false;
  }

  // $: data.qty = data.units * (data.percent / 100);
  // $: data.price = Number(data.bar) / data.qty;
</script>

<Modal {open} ok={false} width="w-11/12" maxWidth="max-w-5xl">
  <button
    on:click={() => (open = false)}
    class="btn btn-sm btn-circle absolute right-2 top-2">✕</button
  >
  <form on:submit|preventDefault={handleSubmit}>
    <div class="flex space-x-8 flex-col md:flex-row space-y-8">
      <Asset asset={data}>
        <p class="w-full text-xs mt-8 mb-2"><em>Click to sell asset.</em></p>
        <button class="btn btn-outline btn-block">Sell Asset</button>
      </Asset>
      <div class="flex md:w-1/2 flex-col">
        <div class="flex justify-center">
          <div class="w-[250px]">
            <Pie items={data.items} user={data.user} />
          </div>
        </div>
        <div class="mt-4">
          <div class="my-2 text-center text-xs">
            <em>Slide for % of Atomic Asset to <u>sell</u></em>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            bind:value={data.percent}
            class="range range-secondary range-xs"
          />
        </div>
        <div class="flex space-x-4 justify-center">
          <div class="form-control w-[150px]">
            <input
              class="input input-bordered rounded-none text-center"
              bind:value={data.percent}
            />
          </div>
          <div class="grid place-items-center">
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
          <div class="form-control">
            <div class="relative">
              <input
                class="input input-bordered rounded-none text-center w-[150px]"
                bind:value={data.u}
                required
              />
              <div
                class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3"
              >
                <span class="font-bold">
                  <svg
                    width="35"
                    height="35"
                    viewBox="0 0 139 139"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M129.984 70.492C129.984 103.349 103.349 129.984 70.492 129.984C37.6355 129.984 11 103.349 11 70.492C11 37.6355 37.6355 11 70.492 11C103.349 11 129.984 37.6355 129.984 70.492Z"
                      fill="#356B9D"
                    />
                    <path
                      d="M78.475 62.3544L77.8648 76.9391L77.5134 89.4356L90.578 96.0789L90.6555 83.49L90.992 68.813L78.475 62.3544Z"
                      fill="white"
                    />
                    <path
                      d="M78.475 62.3544L90.992 68.813L90.992 50.5123L78.5225 44.3098L78.475 62.3544Z"
                      fill="white"
                    />
                    <path
                      d="M77.0315 105.354L90.1354 112.088L90.578 96.0789L77.5134 89.4356L77.0315 105.354Z"
                      fill="white"
                    />
                    <path
                      d="M63.8812 98.3841L77.0315 105.354L77.5134 89.4356L64.378 82.5368L63.8812 98.3841Z"
                      fill="white"
                    />
                    <path
                      d="M50.7922 91.2776L63.8812 98.3841L64.378 82.5368L51.288 75.492L50.7922 91.2776Z"
                      fill="white"
                    />
                    <path
                      d="M64.378 82.5368L64.3812 69.4681L51.288 62.6061L51.288 75.492L64.378 82.5368Z"
                      fill="white"
                    />
                    <path
                      d="M51.288 62.6061L64.3812 69.4681L64.5944 57.1354L51.4971 50.5123L51.288 62.6061Z"
                      fill="white"
                    />
                    <path
                      d="M51.4971 50.5123L64.5944 57.1354L64.9186 38.3895L51.8329 31.0938L51.4971 50.5123Z"
                      fill="white"
                    />
                    <path
                      d="M76.475 62.3544L75.8648 76.9391L75.5134 89.4356L88.578 96.0789L88.6555 83.49L88.992 68.813L76.475 62.3544Z"
                      fill="#EC7F00"
                    />
                    <path
                      d="M76.475 62.3544L88.992 68.813L88.992 50.5123L76.5225 44.3098L76.475 62.3544Z"
                      fill="#EC7F00"
                    />
                    <path
                      d="M75.0315 105.354L88.1354 112.088L88.578 96.0789L75.5134 89.4356L75.0315 105.354Z"
                      fill="#EC7F00"
                    />
                    <path
                      d="M61.8812 98.3841L75.0315 105.354L75.5134 89.4356L62.378 82.5368L61.8812 98.3841Z"
                      fill="#EC7F00"
                    />
                    <path
                      d="M48.7922 91.2776L61.8812 98.3841L62.378 82.5368L49.288 75.492L48.7922 91.2776Z"
                      fill="#EC7F00"
                    />
                    <path
                      d="M62.378 82.5368L62.3812 69.4681L49.288 62.6061L49.288 75.492L62.378 82.5368Z"
                      fill="#EC7F00"
                    />
                    <path
                      d="M49.288 62.6061L62.3812 69.4681L62.5944 57.1354L49.4971 50.5123L49.288 62.6061Z"
                      fill="#EC7F00"
                    />
                    <path
                      d="M49.4971 50.5123L62.5944 57.1354L62.9186 38.3895L49.8329 31.0938L49.4971 50.5123Z"
                      fill="#EC7F00"
                    />
                    <path
                      d="M73.475 63.3544L72.8648 77.9391L72.5134 90.4356L85.578 97.0789L85.6555 84.49L85.992 69.813L73.475 63.3544Z"
                      fill="white"
                    />
                    <path
                      d="M73.475 63.3544L85.992 69.813L85.992 51.5123L73.5225 45.3098L73.475 63.3544Z"
                      fill="white"
                    />
                    <path
                      d="M72.0315 106.354L85.1354 113.088L85.578 97.0789L72.5134 90.4356L72.0315 106.354Z"
                      fill="white"
                    />
                    <path
                      d="M58.8812 99.3841L72.0315 106.354L72.5134 90.4356L59.378 83.5368L58.8812 99.3841Z"
                      fill="white"
                    />
                    <path
                      d="M45.7922 92.2776L58.8812 99.3841L59.378 83.5368L46.288 76.492L45.7922 92.2776Z"
                      fill="white"
                    />
                    <path
                      d="M59.378 83.5368L59.3812 70.4681L46.288 63.6061L46.288 76.492L59.378 83.5368Z"
                      fill="white"
                    />
                    <path
                      d="M46.288 63.6061L59.3812 70.4681L59.5944 58.1354L46.4971 51.5123L46.288 63.6061Z"
                      fill="white"
                    />
                    <path
                      d="M46.4971 51.5123L59.5944 58.1354L59.9186 39.3895L46.8329 32.0938L46.4971 51.5123Z"
                      fill="white"
                    />
                  </svg>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </form>
</Modal>
