<script lang="ts">
  import Design from "./Design.svelte";
  import Preview from "./Preview.svelte";
  import About from "./About.svelte";
  import stlSerializer from "@jscad/stl-serializer";
  import { saveAs } from "file-saver";
  import * as models from "./demo-model";
  import { honeycomb } from "./honeycomb.js";
  import type { Geom3 } from "@jscad/modeling/src/geometries/types";
  import Tab, { Label, Label as TabLabel } from "@smui/tab";
  import TabBar from "@smui/tab-bar";
  import Textfield from "@smui/textfield";
  import HelperText from "@smui/textfield/helper-text";
  import Paper from "@smui/paper";
  import Fab, { Icon } from "@smui/fab";
  import { transforms } from "@jscad/modeling";
  import Button, { Label as ButtonLabel } from "@smui/button";
  import Switch from "@smui/switch";
  import FormField from "@smui/form-field";

  let model: number[][] = structuredClone(models.small.model);

  let active = "About";

  let cellSize = 30;

  let wallWidth = 2.25;

  let height = 22;

  let radius = 1.5;

  let inset = 1;

  let keyholeHorizontalSpace = 50;

  let keyholeHorizontalOffset = 0;

  let keyholeVerticalSpace = 0;

  let keyholeVerticalOffset = 0;

  let holesEnabled = true;

  let cellsRotated = false;

  $: value = JSON.stringify({
    model,
    cellSize,
    wallWidth,
    height,
    radius,
    inset,
    keyholeHorizontalSpace,
    keyholeHorizontalOffset,
    keyholeVerticalSpace,
    keyholeVerticalOffset,
    holesEnabled,
    cellsRotated
  });

  $: {
    localStorage.setItem("state", value);
  }

  loadFromString(localStorage.getItem("state"));

  function loadFromObject(data: models.State) {
    ({
      model = model,
      cellSize = cellSize,
      wallWidth = wallWidth,
      height = height,
      radius = radius,
      inset = inset,
      keyholeHorizontalSpace = keyholeHorizontalSpace,
      keyholeHorizontalOffset = keyholeHorizontalOffset,
      keyholeVerticalSpace = keyholeVerticalSpace,
      keyholeVerticalOffset = keyholeVerticalOffset,
      holesEnabled = holesEnabled,
      cellsRotated = cellsRotated,
    } = structuredClone(data));
  }

  function loadFromString(data: any) {
    try {
      loadFromObject(JSON.parse(data));
    } catch {
      // ignore
    }
  }

  function handleChange(e: CustomEvent) {
    loadFromString((e.target as HTMLTextAreaElement).value);
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
      cellsRotated,
      cellSize / 2,
      wallWidth,
      height,
      radius,
      inset,
      holesEnabled ? keyholeHorizontalSpace : undefined,
      holesEnabled ? keyholeHorizontalOffset : undefined,
      holesEnabled ? keyholeVerticalSpace : undefined,
      holesEnabled ? keyholeVerticalOffset : undefined
    );
  }

  function loadModel(template: models.State) {
    return () => {
      loadFromObject(structuredClone(template) as models.State);
    };
  }

  $: noModel = model.flat().every((a) => a === 0);
</script>

<Fab
  color="primary"
  style="position: fixed; right: 1rem; bottom: 1rem; z-index: 1"
  on:click={download}
  disabled={noModel}
>
  <Icon class="material-icons">download</Icon>
</Fab>

<TabBar
  tabs={["About", "Parameters", "Design", "Preview", "Load/Save"]}
  let:tab
  bind:active
>
  <Tab {tab} disabled={tab === "Preview" && noModel}>
    <TabLabel>{tab}</TabLabel>
  </Tab>
</TabBar>

{#if active === "About"}
  <About />
{:else if active === "Design"}
  <Design bind:model {cellsRotated} />
{:else if active === "Parameters"}
  <Paper variant="unelevated" class="settings">
    <div class="wrap">
      <FormField>
        <Switch bind:checked={cellsRotated} />
        <span slot="label">Rotate cells 30°</span>
      </FormField>
    </div>

    <Textfield label="Depth" type="number" min="0" bind:value={height} />

    <Textfield
      label="Wall width"
      type="number"
      min="0"
      bind:value={wallWidth}
    />

    <Textfield
      label="Inner cell perimeter"
      type="number"
      min="0"
      bind:value={cellSize}
    />

    <Textfield label="Cap radius" type="number" min="0" bind:value={radius} />

    <Textfield label="Cap inset" type="number" min="0" bind:value={inset} />

    <div class="wrap">
      <FormField>
        <Switch bind:checked={holesEnabled} />
        <span slot="label">Wall mount holes</span>
      </FormField>
    </div>

    <Textfield
      label="Horizontal space"
      type="number"
      bind:value={keyholeHorizontalSpace}
      disabled={!holesEnabled}
    >
      <Icon class="material-icons" slot="trailingIcon">percent</Icon>
    </Textfield>

    <Textfield
      label="Horizontal offset"
      type="number"
      bind:value={keyholeHorizontalOffset}
      disabled={!holesEnabled}
    />

    <Textfield
      label="Vertical space"
      type="number"
      bind:value={keyholeVerticalSpace}
      disabled={!holesEnabled}
    >
      <Icon class="material-icons" slot="trailingIcon">percent</Icon>
    </Textfield>

    <Textfield
      label="Vertical offset"
      type="number"
      bind:value={keyholeVerticalOffset}
      disabled={!holesEnabled}
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
      input$rows={8}
    >
      <HelperText slot="helper">Copy/paste to save/load the state</HelperText>
    </Textfield>

    <div class="mdc-typography--subtitle1" style="margin-top: 1rem">
      Load predefined model
    </div>

    <Button>
      <ButtonLabel on:click={loadModel(models.small)}>Small</ButtonLabel>
    </Button>

    <Button>
      <ButtonLabel on:click={loadModel(models.big)}>Big</ButtonLabel>
    </Button>

    <Button>
      <ButtonLabel on:click={loadModel(models.snake)}>Snake</ButtonLabel>
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

  .wrap {
    flex-basis: 100%;
  }
</style>
