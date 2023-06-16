<script lang="ts">
  import Design from "./Design.svelte";
  import Preview from "./Preview.svelte";
  import About from "./About.svelte";
  import stlSerializer from "@jscad/stl-serializer";
  import { saveAs } from "file-saver";
  import * as models from "./demo-model";
  import { honeycomb } from "./honeycomb.js";
  import type { Geom3 } from "@jscad/modeling/src/geometries/types";
  import Tab, { Label as TabLabel } from "@smui/tab";
  import TabBar from "@smui/tab-bar";
  import Textfield from "@smui/textfield";
  import HelperText from "@smui/textfield/helper-text";
  import Paper from "@smui/paper";
  import Fab, { Icon } from "@smui/fab";
  import { transforms } from "@jscad/modeling";
  import Button, { Label as ButtonLabel } from "@smui/button";

  let model: number[][] = structuredClone(models.small);

  let active = "About";

  let cellSize = 30;

  let wallWidth = 2.25;

  let height = 22;

  let radius = 1.5;

  let inset = 1;

  let keyholeHorizontalDistanceOffset = 0;

  let keyholeVerticalOffset = 0;

  $: value = JSON.stringify({
    model,
    cellSize,
    wallWidth,
    height,
    radius,
    inset,
    keyholeHorizontalDistanceOffset,
    keyholeVerticalOffset,
  });

  function handleChange(e: CustomEvent) {
    ({
      model,
      cellSize,
      wallWidth,
      height,
      radius,
      inset,
      keyholeHorizontalDistanceOffset,
      keyholeVerticalOffset,
    } = JSON.parse((e.target as HTMLTextAreaElement).value));
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

      previewModel = transforms.rotateZ(
        Math.PI,
        transforms.center({}, previewModel)
      );
    }
  }

  function makeModel() {
    return honeycomb(
      model,
      cellSize / 2,
      wallWidth,
      height,
      radius,
      inset,
      keyholeHorizontalDistanceOffset,
      keyholeVerticalOffset
    );
  }

  function loadModel(template: number[][]) {
    return () => {
      model = structuredClone(template);
    };
  }
</script>

<Fab
  color="primary"
  style="position: fixed; right: 1rem; bottom: 1rem; z-index: 1"
  on:click={download}
>
  <Icon class="material-icons">download</Icon>
</Fab>

<TabBar
  tabs={["About", "Parameters", "Design", "Preview", "Load/Save"]}
  let:tab
  bind:active
>
  <Tab {tab}>
    <TabLabel>{tab}</TabLabel>
  </Tab>
</TabBar>

{#if active === "About"}
  <About />
{:else if active === "Design"}
  <Design bind:model />
{:else if active === "Parameters"}
  <Paper variant="unelevated" class="settings">
    <Textfield
      label="Inner cell perimeter"
      type="number"
      min="0"
      bind:value={cellSize}
    />

    <Textfield
      label="Wall width"
      type="number"
      min="0"
      bind:value={wallWidth}
    />

    <Textfield label="Depth" type="number" min="0" bind:value={height} />

    <Textfield label="Cap radius" type="number" min="0" bind:value={radius} />

    <Textfield label="Cap inset" type="number" min="0" bind:value={inset} />

    <Textfield
      label="Wall mount holes horiz. dist. offset"
      type="number"
      bind:value={keyholeHorizontalDistanceOffset}
    />

    <Textfield
      label="Wall mount holes vertical offset"
      type="number"
      bind:value={keyholeVerticalOffset}
    />
  </Paper>
{:else if active === "Preview"}
  {#if previewModel}<Preview model={previewModel} />{/if}
{:else if active === "Load/Save"}
  <Paper variant="unelevated" style=" height: 100%">
    <Textfield
      style="width: 100%"
      input$style="width: 100%"
      class="save-area"
      textarea
      {value}
      on:input={handleChange}
      label="State"
      input$resizable={false}
      input$rows={6}
    >
      <HelperText slot="helper">Copy/paste to save/load the state</HelperText>
    </Textfield>

    <div class="mdc-typography--subtitle1" style="margin-top: 1rem">
      Load predefined model
    </div>

    <Button>
      <ButtonLabel on:click={loadModel(models.clear)}>Clear</ButtonLabel>
    </Button>

    <Button>
      <ButtonLabel on:click={loadModel(models.small)}>Small</ButtonLabel>
    </Button>

    <Button>
      <ButtonLabel on:click={loadModel(models.big)}>Big</ButtonLabel>
    </Button>

    <Button>
      <ButtonLabel on:click={loadModel(models.sun)}>Sun</ButtonLabel>
    </Button>
  </Paper>
{/if}

<style>
  :global(.save-area > span) {
    width: 100%;
  }

  :global(.settings) {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
  }
</style>
