import { primitives, booleans, transforms, extrusions } from "@jscad/modeling";
import type { Geom3 } from "@jscad/modeling/src/geometries/types";
import { measureBoundingBox } from "@jscad/modeling/src/measurements";
import { rectangle } from "@jscad/modeling/src/primitives";

const { rotateY, rotate, scale, translate, translateY, translateZ, rotateX } =
  transforms;

const { intersect, subtract, union } = booleans;

const { cuboid, cylinder, polygon, roundedRectangle, torus } = primitives;

const { extrudeLinear } = extrusions;

function roundedHexagon(size: number, height: number, radius: number) {
  const roundRadius = Math.min(
    radius,
    size / 2 - 0.00001,
    height / 2 - 0.00001
  );

  return [0, 1, 2]
    .map((i) =>
      rotateY(
        (i * Math.PI) / 3,
        translateZ(
          -roundRadius - size,
          extrudeLinear(
            { height: (size + roundRadius) * 2 },
            roundRadius > 0
              ? roundedRectangle({
                  size: [size, height],
                  roundRadius,
                  segments: 64,
                })
              : rectangle({ size: [size, height] })
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

function cellInfill(
  size: number,
  height: number,
  thickness: number,
  radius: number,
  inset: number,
  standalone = false
) {
  const a = translateZ(
    height / 2 - (standalone ? inset / 2 + thickness / 2 : inset), // inset; instead of thickness export separate parameter
    rotate(
      [Math.PI / 2, 0, Math.PI / 6],
      roundedHexagon(
        size * 0.8658 - (standalone ? 0.5 /* space */ : 0),
        height - (standalone ? thickness + inset : 0),
        radius
      )
    )
  );

  return standalone
    ? a
    : subtract(
        a,
        translateZ(
          thickness - height / 2,
          cuboid({ size: [size, size, height] })
        )
      );
}

function cell(
  size: number,
  height: number,
  thickness: number,
  radius: number,
  inset: number,
  mode: number
) {
  const a = subtract(
    hexagon(size + thickness * 2, height),
    translateZ(
      mode === 1 ? -0.0001 : thickness,
      hexagon(size, height + thickness * 4)
    )
  );

  return mode === 3
    ? union(a, cellInfill(size, height, thickness, radius, inset))
    : a;
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
  size: number,
  thickness: number,
  height: number,
  radius: number,
  inset: number,
  keyholeHorizontalSpace: number,
  keyholeHorizontalOffset: number,
  keyholeVerticalSpace: number,
  keyholeVerticalOffset: number
) {
  const parts: Geom3[] = [];

  for (let y = 0; y < rows.length; y++) {
    for (let x = 0; x < rows[y].length; x++) {
      const style = rows[y][x];

      if (!style) {
        continue;
      }

      parts.push(
        translate(
          [
            0.75 * x * (size + thickness),
            Math.sqrt(3) * 0.5 * (size + thickness) * ((x % 2) * 0.5 + y),
            0,
          ],
          cell(size, height, thickness, radius, inset, style)
        )
      );
    }
  }

  const keychain = union(
    cellInfill(size, height, thickness, radius, inset, true),
    translateZ(
      height - thickness - inset + 1,
      rotateX(
        Math.PI / 2,
        torus({
          innerRadius: 1.5,
          outerRadius: 3.5,
          outerSegments: 128,
          innerSegments: 64,
        })
      )
    )
  );

  const honeycomb = union(parts);

  const bbox = measureBoundingBox(honeycomb);

  let k1: Geom3 | undefined = undefined;
  let k2: Geom3 | undefined = undefined;
  let holes: Geom3 | undefined = undefined;

  if (
    [
      keyholeHorizontalSpace,
      keyholeHorizontalOffset,
      keyholeVerticalSpace,
      keyholeVerticalOffset,
    ].every((v) => !isNaN(v))
  ) {
    const dx =
      ((bbox[1][0] - bbox[0][0]) * (50 - keyholeHorizontalSpace / 2)) / 100;

    const x1 = bbox[0][0] + dx + keyholeHorizontalOffset;

    const x2 = bbox[1][0] - dx + keyholeHorizontalOffset;

    const dy =
      ((bbox[1][1] - bbox[0][1]) * (50 - keyholeVerticalSpace / 2)) / 100;

    const y1 = bbox[0][1] + dy + keyholeVerticalOffset;

    const y2 = bbox[1][1] - dy + keyholeVerticalOffset;

    k1 = translate([x1, y1 + 5.5, h / 2], scale([0.5, 0.5, 1], keyhole_box()));

    k2 = translate([x2, y2 + 5.5, h / 2], scale([0.5, 0.5, 1], keyhole_box()));

    holes = union(
      translate([x1, y1 + 5.5, h / 2], scale([0.5, 0.5, 1], keyhole())),
      translate([x2, y2 + 5.5, h / 2], scale([0.5, 0.5, 1], keyhole()))
    );
  }

  const keychainBbox = measureBoundingBox(keychain);

  return union(
    holes ? subtract(union(honeycomb, k1, k2), holes) : honeycomb,
    translate(
      [
        bbox[0][0] + (bbox[1][0] - bbox[0][0]) / 2,
        bbox[0][1] - (keychainBbox[1][1] - keychainBbox[0][1]) * (3 / 2),
      ],
      keychain
    )
  );
}
