<script lang="ts">
  import Cell from "./Cell.svelte";
  import SegmentedButton, { Segment } from "@smui/segmented-button";
  import { Label } from "@smui/common";
  import Paper from "@smui/paper";

  export let model: number[][];

  let selected = "vacant";

  const choices = ["clear", "hole", "vacant", "capped"];
</script>

<SegmentedButton
  segments={choices}
  let:segment
  singleSelect
  bind:selected
  style="margin: 1rem 0 0 1rem"
>
  <!-- Note: the `segment` property is required! -->
  <Segment {segment}>
    <Label>{segment}</Label>
  </Segment>
</SegmentedButton>

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
</style>
