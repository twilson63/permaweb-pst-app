<script>
  import { createEventDispatcher } from "svelte";
  import Modal from "../components/modal.svelte";
  import Pie from "../components/pie.svelte";
  import Asset from "../components/asset.svelte";

  export let open;

  export let data = {
    title: "Asset Title",
    percent: 0,
    totalBar: 0,
    units: 100,
    owned: 10,
    canPurchase: 70,
  };

  const dispatch = createEventDispatcher();

  function handleSubmit() {
    dispatch("submit");
  }

  function handleCancel() {
    open = false;
  }

  $: data.qty = data.units * (data.percent / 100);
  $: data.price = Number(data.bar) / data.qty;
</script>

<Modal {open} ok={false} width="w-11/12" maxWidth="max-w-5xl">
  <button
    on:click={() => (open = false)}
    class="btn btn-sm btn-circle absolute right-2 top-2">✕</button
  >
  <form on:submit|preventDefault={handleSubmit}>
    <div class="flex space-x-8 flex-col md:flex-row space-y-8">
      <Asset asset={data} />
      <div class="flex md:w-1/2 flex-col">
        <div class="flex justify-center">
          <div class="w-[250px]">
            <Pie
              bind:purchase={data.percent}
              available={(data.canPurchase / data.units) * 100}
              notAvailable={((data.units - data.owned) / data.units) * 100}
              owned={(data.owned / data.units) * 100 - data.percent}
            />
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
          <div class="form-control">
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
                class="input input-bordered rounded-none text-center"
                bind:value={data.bar}
                required
              />
              <div
                class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3"
              >
                <span class="font-bold">
                  <svg
                    width="20"
                    height="19"
                    viewBox="0 0 20 19"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M10.25 17.632C14.7412 17.632 18.382 13.9912 18.382 9.5C18.382 5.00882 14.7412 1.368 10.25 1.368C5.75882 1.368 2.118 5.00882 2.118 9.5C2.118 13.9912 5.75882 17.632 10.25 17.632ZM10.25 19C15.4967 19 19.75 14.7467 19.75 9.5C19.75 4.25329 15.4967 0 10.25 0C5.00329 0 0.75 4.25329 0.75 9.5C0.75 14.7467 5.00329 19 10.25 19Z"
                      fill="#424242"
                    />
                    <path
                      d="M6.72113 7.1317L8.09462 7.96113L9.65323 7.49052L8.30487 6.67627L6.72113 7.1317Z"
                      fill="#424242"
                    />
                    <path
                      d="M11.2118 7.01991L9.93643 6.42446L8.30487 6.67627L9.65323 7.49052L11.2118 7.01991Z"
                      fill="#424242"
                    />
                    <path
                      d="M6.65993 8.39432L5.26079 7.55164V8.81678L6.65993 8.39432Z"
                      fill="#424242"
                    />
                    <path
                      d="M6.53714 9.58041L7.55619 10.1901L8.91167 9.75051L7.9233 9.15523L6.53714 9.58041Z"
                      fill="#424242"
                    />
                    <path
                      d="M10.7158 10.8371L9.93643 10.3677L8.58947 10.8083L9.38427 11.2838L10.7158 10.8371Z"
                      fill="#424242"
                    />
                    <path
                      d="M10.6937 12.0672L12.0002 12.8489L13.3489 12.423L12.004 11.613L10.6937 12.0672Z"
                      fill="#424242"
                    />
                    <path
                      d="M10.7158 10.8371L9.38427 11.2838L10.6937 12.0672L12.004 11.613L10.7158 10.8371Z"
                      fill="#424242"
                    />
                    <path
                      d="M8.91167 9.75051L7.55619 10.1901L8.58947 10.8083L9.93643 10.3677L8.91167 9.75051Z"
                      fill="#424242"
                    />
                    <path
                      d="M6.65993 8.39432L5.26079 8.81678L6.53714 9.58041L7.9233 9.15523L6.65993 8.39432Z"
                      fill="#424242"
                    />
                    <path
                      d="M10.3079 9.2977L8.91167 9.75051L9.93643 10.3677L11.3267 9.91294L10.3079 9.2977Z"
                      fill="#424242"
                    />
                    <path
                      d="M11.2118 7.01991L9.65323 7.49052L10.8986 8.24259L12.449 7.76703L11.2118 7.01991Z"
                      fill="#424242"
                    />
                    <path
                      d="M13.35 8.31112L12.449 7.76703L10.8986 8.24259L11.829 8.80441L13.35 8.31112Z"
                      fill="#424242"
                    />
                    <path
                      d="M11.829 8.80441L10.3079 9.2977L11.3267 9.91294L12.8432 9.41689L11.829 8.80441Z"
                      fill="#424242"
                    />
                    <path
                      d="M11.3267 9.91294L12.0923 10.3753L13.5953 9.87106L12.8432 9.41689L11.3267 9.91294Z"
                      fill="#424242"
                    />
                    <path
                      d="M13.5953 9.87106L12.0923 10.3753L13.3622 11.1421L14.8475 10.6272L13.5953 9.87106Z"
                      fill="#424242"
                    />
                    <path
                      d="M14.8475 10.6272L13.3622 11.1421L14.7503 11.9804L16.2853 11.4955L14.8475 10.6272Z"
                      fill="#424242"
                    />
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M6.65993 8.39432L5.26079 7.55164L6.72113 7.1317L8.09462 7.96113L6.65993 8.39432Z"
                      fill="#424242"
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
