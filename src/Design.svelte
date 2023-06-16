<script lang="ts">
  import Cell from "./Cell.svelte";
  import SegmentedButton, { Segment } from "@smui/segmented-button";
  import { Label } from "@smui/common";
  import Paper from "@smui/paper";
  import Button, { Label as ButtonLabel } from "@smui/button";

  export let model: number[][];

  let selected = "vacant";

  const choices = ["clear", "hole", "vacant", "capped"];

  function handleClearAll() {
    if (window.confirm("Are you sure?")) {
      model = Array(20)
        .fill(0)
        .map(() => Array(30).fill(0));
    }
  }
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

<Paper variant="unelevated" class="design">
  {#each model as row, y}
    {#each row as value, x}
      <Cell {x} {y} mode={choices.indexOf(selected)} bind:value />
    {/each}
  {/each}
</Paper>

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
</style>
