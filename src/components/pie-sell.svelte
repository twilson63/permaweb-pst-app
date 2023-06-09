<script>
  //RE: https://medium.com/hackernoon/a-simple-pie-chart-in-svg-dbdd653b6936

  import { onMount, afterUpdate } from "svelte";

  export let items = [];
  export let user = "";

  let svgEl;

  afterUpdate(draw);
  $: {
    if (svgEl) {
      draw();
    }
  }

  function draw() {
    // need to increment color by 5
    const colors = ["#85F473", "#F1F1F1", "#4BBEB7", "#5DC5BE", "#85F473"];
    const slices = items.map((item, idx) => {
      return {
        ...item,
        percent: item.percent / 100,
        color: colors[idx],
      };
    });

    // find p
    // change color
    let cumulativePercent = 0;
    slices.forEach((slice) => {
      // destructuring assignment sets the two variables at once
      const [startX, startY] = getCoordinatesForPercent(cumulativePercent);

      // each slice starts where the last slice ended, so keep a cumulative percent
      cumulativePercent += slice.percent;

      const [endX, endY] = getCoordinatesForPercent(cumulativePercent);

      // if the slice is more than 50%, take the large arc (the long way around)
      const largeArcFlag = slice.percent > 0.5 ? 1 : 0;

      // create an array and join it just for code readability
      const pathData = [
        `M ${startX} ${startY}`, // Move
        `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`, // Arc
        `L 0 0`, // Line
      ].join(" ");

      // create a <path> and append it to the <svg> element
      const pathEl = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );
      pathEl.setAttribute("d", pathData);
      pathEl.setAttribute("fill", slice.color);
      svgEl.appendChild(pathEl);
    });

    function getCoordinatesForPercent(percent) {
      const x = Math.cos(2 * Math.PI * percent);
      const y = Math.sin(2 * Math.PI * percent);
      return [x, y];
    }
  }
</script>

<!-- <p>Percent: {percent}</p> -->
<svg bind:this={svgEl} viewBox="-1 -1 2 2" style="transform: rotate(-90deg)" />
