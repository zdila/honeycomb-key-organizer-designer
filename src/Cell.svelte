<script lang="ts">
  export let x: number;
  export let y: number;
  export let value: number;
  export let mode: number;
  export let cellsRotated: boolean;

  $: left = cellsRotated ? x * 260 + (y % 2 ? 130 : 0) : x * 225;
  $: top = cellsRotated ? y * 225 : y * 260 + (x % 2 ? 130 : 0);

  function handleClick(e: MouseEvent) {
    value = e.shiftKey ? 0 : mode;
  }
</script>

<g
  transform={`translate(${left} ${top})${
    cellsRotated ? " rotate(30 155 155)" : ""
  }`}
>
  <polygon
    points="300,150 225,280 75,280 0,150 75,20 225,20"
    on:click={handleClick}
    fill={["white", "#eee", "yellow", "orange"][value]}
    stroke={value ? "black" : "silver"}
    stroke-width={value ? 10 : 2}
  />

  <!-- role="button"
    tabindex="0"
    on:keypress={handleClick} -->
</g>

<!-- <style>
  polygon {
    outline: 0;
  }

  polygon:focus {
    fill: aqua;
  }
</style> -->
