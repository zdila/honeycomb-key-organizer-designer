<script>
  export let x;
  export let y;
  export let value;
  export let mode;

  $: left = x * 72.7;
  $: top = (19 - y) * 83.5 + (x % 2 ? 0 : 41.7);

  function handleClick() {
    value = mode;
  }
</script>

<svg
  width="50"
  viewBox="-5 15 310 290"
  style="left: {left / 2}; top: {top / 2}; z-index: {value ? 1 : 0}"
>
  <polygon
    points="300,150 225,280 75,280 0,150 75,20 225,20"
    on:click={handleClick}
    fill={["white", "#eee", "yellow", "orange"][value]}
    stroke={value ? "black" : "silver"}
    stroke-width={value ? 10 : 2}
  />
</svg>

<style>
  svg {
    position: absolute;
  }
</style>
