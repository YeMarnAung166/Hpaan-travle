function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function totalDistance(order, points) {
  let d = 0;
  for (let i = 0; i < order.length - 1; i++) {
    d += haversine(points[order[i]].lat, points[order[i]].lng, points[order[i + 1]].lat, points[order[i + 1]].lng);
  }
  return d;
}

function nearestNeighbor(points) {
  const n = points.length;
  if (n <= 1) return [0];
  const visited = new Set();
  const order = [0];
  visited.add(0);
  let current = 0;
  while (visited.size < n) {
    let best = -1;
    let bestDist = Infinity;
    for (let i = 0; i < n; i++) {
      if (visited.has(i)) continue;
      const d = haversine(points[current].lat, points[current].lng, points[i].lat, points[i].lng);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    }
    order.push(best);
    visited.add(best);
    current = best;
  }
  return order;
}

function twoOpt(points, order) {
  let improved = true;
  while (improved) {
    improved = false;
    for (let i = 1; i < order.length - 1; i++) {
      for (let k = i + 1; k < order.length; k++) {
        const newOrder = [...order.slice(0, i), ...order.slice(i, k + 1).reverse(), ...order.slice(k + 1)];
        if (totalDistance(newOrder, points) < totalDistance(order, points)) {
          order = newOrder;
          improved = true;
        }
      }
    }
  }
  return order;
}

export function solveTsp(points) {
  if (points.length <= 1) return points;
  let order = nearestNeighbor(points);
  order = twoOpt(points, order);
  return order.map(i => points[i]);
}

export function clusterByGeo(points, numClusters) {
  if (points.length <= numClusters) return points.map((p, i) => [p]);
  if (numClusters <= 1) return [points];

  const sorted = [...points].sort((a, b) => a.lat - b.lat);
  const clusters = [];
  const perCluster = Math.ceil(sorted.length / numClusters);
  for (let i = 0; i < numClusters; i++) {
    const cluster = sorted.slice(i * perCluster, (i + 1) * perCluster);
    if (cluster.length > 0) clusters.push(cluster);
  }
  return clusters;
}

export { haversine };
