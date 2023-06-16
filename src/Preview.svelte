<script lang="ts">
  import { onMount } from "svelte";
  import {
    prepareRender,
    drawCommands,
    cameras,
    entitiesFromSolids,
    controls,
  } from "@jscad/regl-renderer";
  import type { Geom3 } from "@jscad/modeling/src/geometries/types";

  export let model: Geom3;

  $: entities = entitiesFromSolids({}, model);

  let containerElement: HTMLElement;

  const perspectiveCamera = cameras.perspective;

  const orbitControls = controls.orbit;

  const state = {
    controls: orbitControls.defaults,
    camera: { ...perspectiveCamera.defaults, position: [0, 0, 400] },
  };

  $: options = {
    glOptions: { container: containerElement },
    camera: state.camera,
    drawCommands: {
      drawAxis: drawCommands.drawAxis,
      drawGrid: drawCommands.drawGrid,
      drawLines: drawCommands.drawLines,
      drawMesh: drawCommands.drawMesh,
    },
    entities,
    // entities: [
    //   {
    //     // grid data
    //     // the choice of what draw command to use is also data based
    //     visuals: {
    //       drawCmd: "drawGrid",
    //       show: true,
    //     },
    //     size: [500, 500],
    //     ticks: [25, 5],
    //     // color: [0, 0, 1, 1],
    //     // subColor: [0, 0, 1, 0.5]
    //   },
    //   {
    //     visuals: {
    //       drawCmd: "drawAxis",
    //       show: true,
    //     },
    //     size: 300,
    //     // alwaysVisible: false,
    //     // xColor: [0, 0, 1, 1],
    //     // yColor: [1, 0, 1, 1],
    //     // zColor: [0, 0, 0, 1]
    //   },
    //   ...entities,
    // ],
  };

  onMount(() => {
    options.glOptions.container = containerElement;

    const ro = new ResizeObserver(() => {
      perspectiveCamera.setProjection(state.camera, state.camera, {
        width: containerElement.clientWidth,
        height: containerElement.clientHeight,
      });

      updateView = true;
    });

    ro.observe(containerElement);

    const render = prepareRender(options);

    let updateView = true;

    const doRotatePanZoom = () => {
      if (rotateDelta[0] || rotateDelta[1]) {
        const updated = orbitControls.rotate(
          {
            controls: state.controls,
            camera: state.camera,
            speed: rotateSpeed,
          },
          rotateDelta
        );
        state.controls = { ...state.controls, ...updated.controls };
        updateView = true;
        rotateDelta = [0, 0];
      }

      if (panDelta[0] || panDelta[1]) {
        const updated = orbitControls.pan(
          { controls: state.controls, camera: state.camera, speed: panSpeed },
          panDelta
        );
        state.controls = { ...state.controls, ...updated.controls };
        panDelta = [0, 0];
        state.camera.position = updated.camera.position;
        state.camera.target = updated.camera.target;
        updateView = true;
      }

      if (zoomDelta) {
        const updated = orbitControls.zoom(
          { controls: state.controls, camera: state.camera, speed: zoomSpeed },
          zoomDelta
        );
        state.controls = { ...state.controls, ...updated.controls };
        zoomDelta = 0;
        updateView = true;
      }
    };

    let lastX = 0;
    let lastY = 0;

    const rotateSpeed = 0.002;
    const panSpeed = 1;
    const zoomSpeed = 0.08;
    let rotateDelta = [0, 0];
    let panDelta = [0, 0];
    let zoomDelta = 0;
    let pointerDown = false;

    const moveHandler = (ev: PointerEvent) => {
      if (!pointerDown) {
        return;
      }

      const dx = lastX - ev.pageX;
      const dy = ev.pageY - lastY;

      const shiftKey =
        ev.shiftKey === true ||
        ((ev as any).touches && (ev as any).touches.length > 2);

      if (shiftKey || ev.buttons == 2) {
        panDelta[0] += dx;
        panDelta[1] += dy;
      } else {
        rotateDelta[0] -= dx;
        rotateDelta[1] -= dy;
      }

      lastX = ev.pageX;
      lastY = ev.pageY;

      ev.preventDefault();
    };

    const downHandler = (ev: PointerEvent) => {
      pointerDown = true;
      lastX = ev.pageX;
      lastY = ev.pageY;
      containerElement.setPointerCapture(ev.pointerId);
    };

    const upHandler = (ev: PointerEvent) => {
      pointerDown = false;
      containerElement.releasePointerCapture(ev.pointerId);
    };

    const wheelHandler = (ev: WheelEvent) => {
      zoomDelta += ev.deltaY;
      ev.preventDefault();
    };

    containerElement.onpointermove = moveHandler;
    containerElement.onpointerdown = downHandler;
    containerElement.onpointerup = upHandler;
    containerElement.onwheel = wheelHandler;
    containerElement.oncontextmenu = (ev) => {
      ev.preventDefault();
    };

    let rafId: number | undefined;

    const updateAndRender = () => {
      doRotatePanZoom();

      if (updateView) {
        const updates = orbitControls.update({
          controls: state.controls,
          camera: state.camera,
        });

        state.controls = { ...state.controls, ...updates.controls };

        updateView = state.controls.changed; // for elasticity in rotate / zoom

        state.camera.position = updates.camera.position;

        perspectiveCamera.update(state.camera);

        render(options);
      }

      rafId = window.requestAnimationFrame(updateAndRender);
    };

    rafId = window.requestAnimationFrame(updateAndRender);

    return () => {
      if (typeof rafId === "number") {
        window.cancelAnimationFrame(rafId);
      }

      ro.disconnect();
    };
  });
</script>

<div bind:this={containerElement} />

<style>
  div {
    width: 100%;
    height: 100%;
    flex-grow: 1;
  }
</style>
