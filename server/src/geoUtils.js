/**
 * Geo calculation utilities for College Bus Real-Time Tracking
 */

// Earth radius in kilometers
const EARTH_RADIUS_KM = 6371;

/**
 * Calculates Haversine distance between two coordinates in kilometers
 */
export function getDistanceKm(lat1, lon1, lat2, lon2) {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

/**
 * Calculates bearing / heading in degrees (0 - 360) from point 1 to point 2
 */
export function calculateBearing(lat1, lon1, lat2, lon2) {
  const y = Math.sin(toRad(lon2 - lon1)) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(toRad(lon2 - lon1));
  const bearing = (toDeg(Math.atan2(y, x)) + 360) % 360;
  return Math.round(bearing);
}

/**
 * Estimate arrival time (in minutes) from bus to a given stop
 * @param {number} distanceKm - distance along route to stop
 * @param {number} speedKmh - current or average speed
 * @param {number} intermediateStopsCount - number of stops between bus and destination
 * @param {number} trafficFactor - 1.0 = normal, 1.3 = moderate, 1.8 = heavy
 */
export function calculateEtaMinutes(distanceKm, speedKmh = 30, intermediateStopsCount = 0, trafficFactor = 1.0) {
  const effectiveSpeed = Math.max(speedKmh, 15); // min speed assumption in traffic
  const travelHours = (distanceKm / effectiveSpeed) * trafficFactor;
  const dwellMinutes = intermediateStopsCount * 0.75; // 45 seconds average stop dwell
  const totalMinutes = Math.round((travelHours * 60) + dwellMinutes);
  return Math.max(totalMinutes, 1);
}

/**
 * Linearly interpolates between two coordinates
 */
export function interpolate(p1, p2, fraction) {
  return {
    lat: p1.lat + (p2.lat - p1.lat) * fraction,
    lng: p1.lng + (p2.lng - p1.lng) * fraction,
  };
}

/**
 * Find nearest stop to a user's current GPS position
 */
export function findNearestStop(userLat, userLng, stops) {
  let minDistance = Infinity;
  let nearest = null;

  stops.forEach((stop) => {
    const dist = getDistanceKm(userLat, userLng, stop.lat, stop.lng);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = stop;
    }
  });

  const walkingSpeedKmh = 4.8;
  const walkMinutes = Math.round((minDistance / walkingSpeedKmh) * 60);

  return {
    stop: nearest,
    distanceKm: parseFloat(minDistance.toFixed(2)),
    walkingMinutes: Math.max(walkMinutes, 1),
  };
}

function toRad(degrees) {
  return (degrees * Math.PI) / 180;
}

function toDeg(rad) {
  return (rad * 180) / Math.PI;
}
