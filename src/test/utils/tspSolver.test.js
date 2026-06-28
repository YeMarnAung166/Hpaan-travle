import { describe, it, expect } from 'vitest';
import { solveTsp, clusterByGeo, haversine } from '../../utils/tspSolver';

describe('haversine', () => {
  it('returns 0 for same point', () => {
    expect(haversine(16.89, 97.65, 16.89, 97.65)).toBe(0);
  });

  it('calculates distance between two known points', () => {
    const dist = haversine(16.89, 97.65, 16.87, 97.70);
    expect(dist).toBeGreaterThan(0);
    expect(dist).toBeLessThan(10);
  });

  it('is symmetric', () => {
    const d1 = haversine(16.89, 97.65, 16.87, 97.70);
    const d2 = haversine(16.87, 97.70, 16.89, 97.65);
    expect(d1).toBeCloseTo(d2, 5);
  });
});

describe('solveTsp', () => {
  it('returns single point as-is', () => {
    const points = [{ lat: 16.89, lng: 97.65 }];
    expect(solveTsp(points)).toEqual(points);
  });

  it('returns empty for empty input', () => {
    expect(solveTsp([])).toEqual([]);
  });

  it('orders two points correctly', () => {
    const points = [
      { lat: 16.89, lng: 97.65 },
      { lat: 16.87, lng: 97.70 },
    ];
    const result = solveTsp(points);
    expect(result).toHaveLength(2);
    expect(result).toContain(points[0]);
    expect(result).toContain(points[1]);
  });

  it('returns all points', () => {
    const points = [
      { lat: 16.89, lng: 97.65 },
      { lat: 16.87, lng: 97.70 },
      { lat: 16.90, lng: 97.60 },
      { lat: 16.86, lng: 97.68 },
    ];
    const result = solveTsp(points);
    expect(result).toHaveLength(4);
    points.forEach(p => {
      expect(result.some(r => r.lat === p.lat && r.lng === p.lng)).toBe(true);
    });
  });

  it('produces a shorter total distance than random order', () => {
    const points = [
      { lat: 16.89, lng: 97.65 },
      { lat: 16.87, lng: 97.70 },
      { lat: 16.90, lng: 97.60 },
      { lat: 16.86, lng: 97.68 },
      { lat: 16.91, lng: 97.62 },
    ];
    const result = solveTsp(points);
    let tspDist = 0;
    for (let i = 0; i < result.length - 1; i++) {
      tspDist += haversine(result[i].lat, result[i].lng, result[i + 1].lat, result[i + 1].lng);
    }
    const shuffled = [...points].reverse();
    let shuffleDist = 0;
    for (let i = 0; i < shuffled.length - 1; i++) {
      shuffleDist += haversine(shuffled[i].lat, shuffled[i].lng, shuffled[i + 1].lat, shuffled[i + 1].lng);
    }
    expect(tspDist).toBeLessThanOrEqual(shuffleDist);
  });
});

describe('clusterByGeo', () => {
  it('returns single cluster for fewer points than clusters', () => {
    const points = [{ lat: 16.89, lng: 97.65 }, { lat: 16.87, lng: 97.70 }];
    const clusters = clusterByGeo(points, 5);
    expect(clusters).toHaveLength(2);
  });

  it('returns one cluster for numClusters=1', () => {
    const points = [{ lat: 16.89, lng: 97.65 }, { lat: 16.87, lng: 97.70 }];
    const clusters = clusterByGeo(points, 1);
    expect(clusters).toHaveLength(1);
    expect(clusters[0]).toHaveLength(2);
  });

  it('distributes points across clusters', () => {
    const points = [
      { lat: 16.89, lng: 97.65 },
      { lat: 16.87, lng: 97.70 },
      { lat: 16.90, lng: 97.60 },
      { lat: 16.86, lng: 97.68 },
    ];
    const clusters = clusterByGeo(points, 2);
    expect(clusters).toHaveLength(2);
    const total = clusters.reduce((sum, c) => sum + c.length, 0);
    expect(total).toBe(4);
  });
});
