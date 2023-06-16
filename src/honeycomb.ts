import { primitives, booleans, transforms, extrusions } from "@jscad/modeling";
import type { Geom3 } from "@jscad/modeling/src/geometries/types";
import { rotateZ } from "@jscad/modeling/src/operations/transforms";

const { rotateY, rotate, scale, translate, translateY, translateZ, rotateX } =
  transforms;

const { intersect, subtract, union } = booleans;

const { cuboid, cylinder, polygon, roundedRectangle, torus } = primitives;

const { extrudeLinear } = extrusions;

function roundedHexagon(size: number, height: number, radius: number) {
  return [0, 1, 2]
    .map((i) =>
      rotateY(
        (i * Math.PI) / 3,
        translateZ(
          radius - size,
          extrudeLinear(
            { height: (size - radius) * 2 },
            roundedRectangle({
              size: [size, height],
              roundRadius: radius,
            })
          )
        )
      )
    )
    .reduce((a, b) => intersect(a, b));
}

function hexagon(size: number, height: number) {
  const b = (Math.sqrt(3) * size) / 4;

  return extrudeLinear(
    { height },
    polygon({
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

function fullCell(
  size: number,
  height: number,
  thickness: number,
  radius: number
) {
  return subtract(
    translateZ(
      height / 2 - thickness / 8, // instead of thickness export separate parameter
      rotate(
        [Math.PI / 2, 0, Math.PI / 6],
        roundedHexagon((size - thickness) * 0.8658, height, radius)
      )
    ),
    translateZ(-height / 2 + thickness/2, cuboid({ size: [size, size, height] }))
  );
}

function cell(
  size: number,
  height: number,
  thickness: number,
  radius: number,
  mode: number
) {
  const a = subtract(
    hexagon(size, height),
    translateZ(
      mode === 1 ? -thickness : thickness / 2,
      hexagon(size - thickness, height + thickness * 2)
    )
  );

  return mode === 3 ? union(a, fullCell(size, height, thickness, radius)) : a;
}

const h = 7;

function keyhole_box() {
  const m = 2;

  return union(
    cylinder({ height: h, radius: 10 + m }),
    translateY(-20, cylinder({ height: h, radius: 10 + m })),
    translateY(-10, cuboid({ size: [20 + 2 * m, 20, h] }))
  );
}

function keyhole() {
  const hh = 6;
  const d = 1.5;

  return union(
    // big outer hole
    translate([0, 0, -d], cylinder({ height: hh + d, radius: 10 })),
    // big inner hole
    translate([0, -20, 0], cylinder({ height: hh - d, radius: 10 })),
    // small inner hole
    translate([0, -20, -2 * d], cylinder({ height: 2 * d, radius: 5 })),
    // small outer space
    translate([0, -10, -2 * d], cuboid({ size: [10, 20, hh] })),
    // big inner space
    translate([0, -10, 0], cuboid({ size: [20, 20, hh - d] }))
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
        translate(
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

  return union(
    subtract(
      union(
        ...parts,
        translate(
          [...keyholeCoords[0], h / 2],
          scale([0.5, 0.5, 1], keyhole_box())
        ),
        translate(
          [...keyholeCoords[1], h / 2],
          scale([0.5, 0.5, 1], keyhole_box())
        )
      ),
      union(
        translate(
          [...keyholeCoords[0], h / 2],
          scale([0.5, 0.5, 1], keyhole())
        ),
        translate([...keyholeCoords[1], h / 2], scale([0.5, 0.5, 1], keyhole()))
      )
    ),
    fullCell(size, height, thickness, radius),
    translateZ(
      height + 1.5,
      rotateX(
        Math.PI / 2,
        torus({ innerRadius: 1.5, outerRadius: 5 })
      )
    )
  );
}
