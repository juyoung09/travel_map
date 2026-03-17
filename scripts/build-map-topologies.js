const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const dataDir = path.join(rootDir, "data");
const outputFile = path.join(rootDir, "map-data.js");
const JAPAN_TOLERANCE = 0.03;
const JAPAN_PRECISION = 3;

function readJson(fileName) {
  return JSON.parse(fs.readFileSync(path.join(dataDir, fileName), "utf8"));
}

function simplifyRing(ring, tolerance) {
  if (!Array.isArray(ring) || ring.length <= 8) {
    return ring;
  }

  const first = ring[0];
  const last = ring[ring.length - 1];
  const isClosed = first[0] === last[0] && first[1] === last[1];
  const working = isClosed ? ring.slice(0, -1) : ring.slice();
  const simplified = simplifyLine(working, tolerance);
  const usable = simplified.length >= 3 ? simplified : working.slice(0, 3);
  const rounded = usable.map((point) => roundPoint(point, JAPAN_PRECISION));
  return isClosed ? [...rounded, rounded[0]] : rounded;
}

function simplifyLine(points, tolerance) {
  if (points.length <= 2) {
    return points.slice();
  }

  let maxDistance = 0;
  let index = -1;

  for (let i = 1; i < points.length - 1; i += 1) {
    const distance = perpendicularDistance(points[i], points[0], points[points.length - 1]);
    if (distance > maxDistance) {
      maxDistance = distance;
      index = i;
    }
  }

  if (maxDistance <= tolerance) {
    return [points[0], points[points.length - 1]];
  }

  const left = simplifyLine(points.slice(0, index + 1), tolerance);
  const right = simplifyLine(points.slice(index), tolerance);
  return [...left.slice(0, -1), ...right];
}

function perpendicularDistance(point, start, end) {
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];

  if (dx === 0 && dy === 0) {
    return Math.hypot(point[0] - start[0], point[1] - start[1]);
  }

  return Math.abs(dy * point[0] - dx * point[1] + end[0] * start[1] - end[1] * start[0]) / Math.hypot(dx, dy);
}

function roundPoint(point, precision) {
  const factor = 10 ** precision;
  return [
    Math.round(point[0] * factor) / factor,
    Math.round(point[1] * factor) / factor
  ];
}

function simplifyGeometry(geometry, tolerance) {
  if (geometry.type === "Polygon") {
    return {
      type: "Polygon",
      coordinates: geometry.coordinates.map((ring) => simplifyRing(ring, tolerance))
    };
  }

  if (geometry.type === "MultiPolygon") {
    return {
      type: "MultiPolygon",
      coordinates: geometry.coordinates.map((polygon) => polygon.map((ring) => simplifyRing(ring, tolerance)))
    };
  }

  return geometry;
}

function simplifyFeatureCollection(collection, tolerance) {
  return {
    type: collection.type,
    features: collection.features.map((feature) => ({
      ...feature,
      geometry: simplifyGeometry(feature.geometry, tolerance)
    }))
  };
}

const payload = {
  world: readJson("world-countries-110m.json"),
  skoreaProvinces: readJson("skorea-provinces-2018-topo-simple.json"),
  skoreaMunicipalities: readJson("skorea-municipalities-2018-topo-simple.json"),
  skoreaSubmunicipalities: readJson("skorea-submunicipalities-2018-topo-simple.json"),
  japanPrefectures: simplifyFeatureCollection(readJson("japan-prefectures.geojson"), JAPAN_TOLERANCE),
  isoCountries: readJson("iso-3166-all.json")
};

fs.writeFileSync(outputFile, `window.MAP_TOPOLOGIES = ${JSON.stringify(payload)};\n`, "utf8");

console.log(`Wrote ${path.relative(rootDir, outputFile)}`);
