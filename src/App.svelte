<script lang="ts">
  import Cell from "./Cell.svelte";
  import Preview from "./Preview.svelte";
  import stlSerializer from "@jscad/stl-serializer";
  import { saveAs } from "file-saver";

  import { demoModel } from "./demo-model";
  import { honeycomb } from "./honeycomb.js";
  import type { Geom3 } from "@jscad/modeling/src/geometries/types";

  import Tab, { Label as TabLabel } from "@smui/tab";
  import TabBar from "@smui/tab-bar";
  import SegmentedButton, { Segment } from "@smui/segmented-button";
  import { Label } from "@smui/common";
  import Textfield from "@smui/textfield";
  import Paper from "@smui/paper";
  import Fab, { Icon } from "@smui/fab";

  // let model = Array(20)
  //   .fill()
  //   .map(() =>
  //     Array(30)
  //       .fill()
  //       .map(() => 0)
  //   );

  let model = demoModel;

  $: value = JSON.stringify(model);

  function handleChange(e) {
    model = JSON.parse(e.target.value);
  }

  function download() {
    saveAs(
      new Blob(stlSerializer.serialize({ binary: true }, makeModel())),
      "model.stl"
    );
  }

  let previewModel: Geom3 | undefined;

  $: {
    if (active === "Preview") {
      previewModel = makeModel();
    }
  }

  function makeModel() {
    return honeycomb(
      model,
      cellSize,
      cellSpacing,
      height,
      radius,
      kc1x && kc1y && kc2x && kc2y
        ? [
            [kc1x, kc1y],
            [kc2x, kc2y],
          ]
        : undefined
    );
  }

  let active = "Design";

  let selected = "vacant";

  let cellSize = 17.3;

  let cellSpacing = 4.5;

  let height = 22;

  let radius = 1.5;

  let kc1x = 90.8;
  let kc1y = 120;
  let kc2x = 246.5;
  let kc2y = 120;

  const choices = ["clear", "hole", "vacant", "occupied"];
</script>

<Fab
  color="primary"
  style="position: fixed; right: 1rem; bottom: 1rem; z-index: 1"
  on:click={download}
>
  <Icon class="material-icons">download</Icon>
</Fab>

<TabBar
  tabs={["Parameters", "Design", "Preview", "Load/Save"]}
  let:tab
  bind:active
>
  <Tab {tab}>
    <TabLabel>{tab}</TabLabel>
  </Tab>
</TabBar>

{#if active === "Design"}
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

  <main>
    {#each model as row, y}
      {#each row as value, x}
        <Cell {x} {y} mode={choices.indexOf(selected)} bind:value />
      {/each}
    {/each}
  </main>
{:else if active === "Parameters"}
  <Paper variant="unelevated">
    <Textfield label="Cell size" type="number" min="0" bind:value={cellSize} />

    <Textfield
      label="Cell spacing"
      type="number"
      min="0"
      bind:value={cellSpacing}
    />

    <Textfield label="Height" type="number" min="0" bind:value={height} />

    <Textfield label="Cap radius" type="number" min="0" bind:value={radius} />

    <div class="mdc-typography--subtitle1" style="margin-top: 1rem">
      Wall mount holes
    </div>

    <Textfield label="X1" type="number" min="0" bind:value={kc1x} />

    <Textfield label="Y1" type="number" min="0" bind:value={kc1y} />

    <Textfield label="X2" type="number" min="0" bind:value={kc2x} />

    <Textfield label="Y2" type="number" min="0" bind:value={kc2y} />
  </Paper>
{:else if active === "Preview"}
  {#if previewModel}<Preview model={previewModel} />{/if}
{:else if active === "Load/Save"}
  <Paper variant="unelevated" style=" height: 100%">
    <Textfield
      style="width: 100%; height: 100%"
      input$style="width: 100%; height: 100%"
      class="save-area"
      textarea
      {value}
      on:input={handleChange}
      label="State"
      input$resizable={false}
    />
  </Paper>
{/if}

<header>
  <section />
</header>

<style>
  main {
    position: relative;
    margin-top: 1rem;
    height: 100%;
    overflow: auto;
  }

  :global(.save-area) {
    height: 100%;
  }

  :global(.save-area > span) {
    width: 100%;
    height: calc(100% - 32px);
  }
</style>