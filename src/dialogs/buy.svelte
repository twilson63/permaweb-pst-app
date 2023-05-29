<script>
  import { createEventDispatcher } from "svelte";
  import Modal from "../components/modal.svelte";
  import Pie from "../components/pie.svelte";

  export let open;

  export let data = {
    title: "Asset Title",
    percent: 0,
    bar: 0,
  };

  export let buyQty = 0;

  const dispatch = createEventDispatcher();

  $: {
    let purchase = Math.floor(Number(buyQty) / Number(data.price));
    let remaining =
      Number(data.units) - Math.floor(Number(buyQty) / Number(data.price));
    let percent = Math.floor((purchase / remaining) * 100);

    data.percent = percent;
  }

  function handleSubmit() {
    dispatch("submit");
  }
  function handleCancel() {
    open = false;
  }
</script>

<Modal {open} ok={false}>
  <button
    on:click={() => (open = false)}
    class="btn btn-sm btn-circle absolute right-2 top-2">✕</button
  >
  <h1 class="mb-16 text-3xl font-bold">
    Purchase Asset: <br /><span class="text-3xl font-normal">{data.name}</span>
  </h1>
  <div class="flex space-x-8">
    <div class="w-[350px]">
      <Pie
        bind:purchase={data.percent}
        available={(data.canPurchase / data.units) * 100 - data.percent}
        notAvailable={((data.units - data.canPurchase - data.owned) /
          data.units) *
          100}
        owned={(data.owned / data.units) * 100}
      />
    </div>
    <div>
      <form class="form" on:submit|preventDefault={handleSubmit}>
        <div class="form-control w-2/3">
          <label class="label" for="spend">I will spend...</label>
          <div class="relative">
            <input
              id="spend"
              type="text"
              class="input input-bordered w-full"
              bind:value={buyQty}
            />
            <div
              class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3"
            >
              <!-- Heroicon name: mini/exclamation-circle -->
              <span class="font-bold"
                ><svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="29"
                  height="29"
                  viewBox="0 0 29 29"
                  fill="none"
                  class="injected-svg"
                  data-src="https://g8way.io/PoXn1g11wClhSe6xWymDLjNcjYhe5XjNu0n2TqPdY-U/assets/rebar-logo-2851c9d8.svg"
                  xmlns:xlink="http://www.w3.org/1999/xlink"
                  role="img"
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M14.5 26.912C21.355 26.912 26.912 21.355 26.912 14.5C26.912 7.64504 21.355 2.088 14.5 2.088C7.64504 2.088 2.088 7.64504 2.088 14.5C2.088 21.355 7.64504 26.912 14.5 26.912ZM14.5 29C22.5081 29 29 22.5081 29 14.5C29 6.49187 22.5081 0 14.5 0C6.49187 0 0 6.49187 0 14.5C0 22.5081 6.49187 29 14.5 29Z"
                    fill="black"
                  />
                  <path
                    d="M9.11382 10.8852L11.2102 12.1512L13.5891 11.4329L11.5311 10.1901L9.11382 10.8852Z"
                    fill="black"
                  />
                  <path
                    d="M15.9681 10.7146L14.0214 9.80576L11.5311 10.1901L13.5891 11.4329L15.9681 10.7146Z"
                    fill="black"
                  />
                  <path
                    d="M9.02042 12.8124L6.88489 11.5262V13.4572L9.02042 12.8124Z"
                    fill="black"
                  />
                  <path
                    d="M8.833 14.6227L10.3884 15.5533L12.4573 14.8824L10.9487 13.9738L8.833 14.6227Z"
                    fill="black"
                  />
                  <path
                    d="M15.2109 16.5408L14.0214 15.8244L11.9655 16.4969L13.1786 17.2227L15.2109 16.5408Z"
                    fill="black"
                  />
                  <path
                    d="M15.1772 18.4184L17.1714 19.6115L19.2299 18.9614L17.1772 17.7251L15.1772 18.4184Z"
                    fill="black"
                  />
                  <path
                    d="M15.2109 16.5408L13.1786 17.2227L15.1772 18.4184L17.1772 17.7251L15.2109 16.5408Z"
                    fill="black"
                  />
                  <path
                    d="M12.4573 14.8824L10.3884 15.5533L11.9655 16.4969L14.0214 15.8244L12.4573 14.8824Z"
                    fill="black"
                  />
                  <path
                    d="M9.02042 12.8124L6.88489 13.4572L8.833 14.6227L10.9487 13.9738L9.02042 12.8124Z"
                    fill="black"
                  />
                  <path
                    d="M14.5884 14.1912L12.4573 14.8824L14.0214 15.8244L16.1434 15.1303L14.5884 14.1912Z"
                    fill="black"
                  />
                  <path
                    d="M15.9681 10.7146L13.5891 11.4329L15.49 12.5808L17.8564 11.8549L15.9681 10.7146Z"
                    fill="black"
                  />
                  <path
                    d="M19.2316 12.6854L17.8564 11.8549L15.49 12.5808L16.91 13.4383L19.2316 12.6854Z"
                    fill="black"
                  />
                  <path
                    d="M16.91 13.4383L14.5884 14.1912L16.1434 15.1303L18.458 14.3731L16.91 13.4383Z"
                    fill="black"
                  />
                  <path
                    d="M16.1434 15.1303L17.312 15.836L19.606 15.0664L18.458 14.3731L16.1434 15.1303Z"
                    fill="black"
                  />
                  <path
                    d="M19.606 15.0664L17.312 15.836L19.2502 17.0064L21.5172 16.2205L19.606 15.0664Z"
                    fill="black"
                  />
                  <path
                    d="M21.5172 16.2205L19.2502 17.0064L21.3688 18.2858L23.7118 17.5458L21.5172 16.2205Z"
                    fill="black"
                  />
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M9.02042 12.8124L6.88489 11.5262L9.11382 10.8852L11.2102 12.1512L9.02042 12.8124Z"
                    fill="black"
                  />
                </svg></span
              >
            </div>
          </div>
        </div>
        <div class="form-control w-2/3">
          <label class="label" for="percent">I will receive...</label>
          <div class="relative">
            <input
              id="percent"
              type="text"
              class="input input-bordered w-full"
              bind:value={data.percent}
              readonly
            />
            <div
              class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3"
            >
              <!-- Heroicon name: mini/exclamation-circle -->
              <span class="font-bold">%</span>
            </div>
          </div>
        </div>
        <div class="mt-16">
          <button class="btn btn-outline btn-block rounded-none">Buy</button>
          <!--
          <button
            type="button"
            class="btn btn-outline rounded-none"
            on:click={handleCancel}>Cancel</button
          >
          -->
        </div>
      </form>
    </div>
  </div>
</Modal>
