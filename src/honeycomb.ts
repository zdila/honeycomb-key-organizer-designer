import {
  primitives,
  booleans,
  transforms,
  expansions,
  extrusions,
} from "@jscad/modeling";
import type { Geom3 } from "@jscad/modeling/src/geometries/types";

function roundedHexagon(s: number, h: number, radius: number) {
  let size = s - radius * 2;

  let height = h - radius;

  return [0, 1, 2]
    .map((i) =>
      transforms.rotateY(
        (i * Math.PI) / 3,
        transforms.translateZ(
          -size - radius,
          extrusions.extrudeLinear(
            { height: (size + radius) * 2 },
            expansions.offset(
              { delta: radius, corners: "round", segments: 100 },
              primitives.rectangle({ size: [size, height] })
            )
          )
        )
      )
    )
    .reduce((a, b) => booleans.intersect(a, b));
}

function hexagon(size: number, height: number) {
  const b = (Math.sqrt(3) * size) / 4;

  return extrusions.extrudeLinear(
    { height },
    primitives.polygon({
      points: [
        [size / 2, 0],
        [size / 4, b],
        [-size / 4, b],
        [-size / 2, 0],
        [-size / 4, -b],
        [size / 4, -b],
      ],
    })
  );
}

function cell(
  size: number,
  height: number,
  thickness: number,
  radius: number,
  mode: number
) {
  const a = booleans.subtract(
    hexagon(size, height),
    transforms.translateZ(
      mode === 1 ? -thickness : thickness / 2,
      hexagon(size - thickness, height + thickness * 2)
    )
  );

  return mode === 3
    ? booleans.union(
        a,
        booleans.subtract(
          transforms.translateZ(
            (height - radius) / 2 - thickness / 4, // insteaf of thickness export separate parameter
            transforms.rotate(
              [Math.PI / 2, 0, Math.PI / 6],
              roundedHexagon((size - thickness) * 0.8658, height, radius)
            )
          ),
          transforms.translateZ(
            0,
            primitives.cuboid({ size: [size, size, height] })
          )
        )
      )
    : a;
}

const h = 7;

function keyhole_box() {
  const m = 2;

  return booleans.union(
    primitives.cylinder({ height: h, radius: 10 + m }),
    transforms.translateY(
      -20,
      primitives.cylinder({ height: h, radius: 10 + m })
    ),
    transforms.translateY(-10, primitives.cuboid({ size: [20 + 2 * m, 20, h] }))
  );
}

function keyhole() {
  const hh = 6;
  const d = 1.5;

  return booleans.union(
    // big outer hole
    transforms.translate(
      [0, 0, -d],
      primitives.cylinder({ height: hh + d, radius: 10 })
    ),
    // big inner hole
    transforms.translate(
      [0, -20, 0],
      primitives.cylinder({ height: hh - d, radius: 10 })
    ),
    // small inner hole
    transforms.translate(
      [0, -20, -2 * d],
      primitives.cylinder({ height: 2 * d, radius: 5 })
    ),
    // small outer space
    transforms.translate(
      [0, -10, -2 * d],
      primitives.cuboid({ size: [10, 20, hh] })
    ),
    // big inner space
    transforms.translate(
      [0, -10, 0],
      primitives.cuboid({ size: [20, 20, hh - d] })
    )
  );
}

export function honeycomb(
  rows: number[][],
  s: number,
  thickness: number,
  height: number,
  radius: number,
  keyholeCoords: [[number, number], [number, number]] | undefined
) {
  const size = s + thickness / 2;

  const parts: Geom3[] = [];

  for (let y = 0; y < rows.length; y++) {
    for (let x = 0; x < rows[y].length; x++) {
      const style = rows[y][x];

      if (!style) {
        continue;
      }

      const ratio = size - thickness / 2;

      parts.push(
        transforms.translate(
          [
            0.75 * x * ratio,
            Math.sqrt(3) * 0.5 * ratio * ((x % 2) * 0.5 + y),
            0,
          ],
          cell(size, height, thickness, radius, style)
        )
      );
    }
  }

  return booleans.subtract(
    booleans.union(
      ...parts,
      transforms.translate(
        [...keyholeCoords[0], h / 2],
        transforms.scale([0.5, 0.5, 1], keyhole_box())
      ),
      transforms.translate(
        [...keyholeCoords[1], h / 2],
        transforms.scale([0.5, 0.5, 1], keyhole_box())
      )
    ),
    booleans.union(
      transforms.translate(
        [...keyholeCoords[0], h / 2],
        transforms.scale([0.5, 0.5, 1], keyhole())
      ),
      transforms.translate(
        [...keyholeCoords[1], h / 2],
        transforms.scale([0.5, 0.5, 1], keyhole())
      )
    )
  );
}
