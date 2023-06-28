<script lang="ts">
  import Cell from "./Cell.svelte";
  import SegmentedButton, { Segment } from "@smui/segmented-button";
  import { Label } from "@smui/common";
  import Button, { Label as ButtonLabel } from "@smui/button";

  export let model: number[][];

  export let cellsRotated = false;

  let selected = "vacant";

  const choices = ["clear", "hole", "vacant", "capped"];

  function handleClearAll() {
    if (window.confirm("Are you sure?")) {
      model = Array(20)
        .fill(0)
        .map(() => Array(30).fill(0));
    }
  }

  let width = (model[0].length * (cellsRotated ? 260 : 225) + 180 + 10) / 6;

  let height = (model.length * (cellsRotated ? 225 : 260) + 180 + 10) / 6;
</script>

<div class="toolbar">
  <SegmentedButton segments={choices} let:segment singleSelect bind:selected>
    <!-- Note: the `segment` property is required! -->
    <Segment {segment}>
      <Label>{segment}</Label>
    </Segment>
  </SegmentedButton>

  <Button variant="outlined" on:click={handleClearAll}
    ><ButtonLabel>Clear all</ButtonLabel></Button
  >
</div>

<!-- width={(model[0].length * (cellsRotated ? 260 : 225) + 180 + 10) / 6} -->
<svg
  style="width: {width}px; min-width: {width}px; min-height: {height}px; height: {height}px"
  viewBox={cellsRotated
    ? `-10 -10 ${model[0].length * 260 + 180} ${model.length * 225 + 100}`
    : `-10 -10 ${model[0].length * 225 + 100} ${model.length * 260 + 180}`}
>
  {#each [true, false] as clear}
    {#each model as row, y}
      {#each row as value, x}
        {#if !value === clear}
          <Cell
            {x}
            {y}
            mode={choices.indexOf(selected)}
            bind:value
            {cellsRotated}
          />
        {/if}
      {/each}
    {/each}
  {/each}
</svg>

<style>
  :global(.design) {
    position: relative;
    height: 100%;
    overflow: auto;
  }

  .toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: center;
    margin: 1rem 0 0 1rem;
  }

  svg {
    margin: 1rem;
    /* border: 1px solid red; */
    transform: scaleY(-1);
  }
</style>
