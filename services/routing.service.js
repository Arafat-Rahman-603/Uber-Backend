import axios from "axios";

/**
 * Helper to create a human-readable instruction from an OSRM step.
 * OSRM provides a 'maneuver' object and a 'name' for the road.
 */
const buildInstruction = (step) => {
  const { maneuver, name, distance, duration } = step;
  const type = maneuver?.type || "continue";
  const modifier = maneuver?.modifier || "";
  const road = name || "the road";

  let action = "";

  switch (type) {
    case "depart":
      action = `Head ${modifier} on ${road}`;
      break;
    case "arrive":
      action = `Arrive at your destination`;
      break;
    case "turn":
      action = `Turn ${modifier} onto ${road}`;
      break;
    case "new name":
      action = `Continue onto ${road}`;
      break;
    case "continue":
      action = `Continue onto ${road}`;
      break;
    case "merge":
      action = `Merge ${modifier} onto ${road}`;
      break;
    case "on ramp":
      action = `Take the ${modifier} ramp onto ${road}`;
      break;
    case "off ramp":
      action = `Take the off-ramp onto ${road}`;
      break;
    case "fork":
      action = `Keep ${modifier} at the fork onto ${road}`;
      break;
    case "end of road":
      action = `Turn ${modifier} at the end of ${road}`;
      break;
    case "roundabout":
      action = `Enter the roundabout and take exit ${maneuver.exit || ""} onto ${road}`;
      break;
    case "rotary":
      action = `Enter the rotary and take exit ${maneuver.exit || ""} onto ${road}`;
      break;
    default:
      action = `Continue on ${road}`;
  }

  return {
    instruction: action,
    distance: Math.round(distance), // meters
    duration: Math.round(duration), // seconds
    type,
    modifier,
    road,
    coordinate: maneuver?.location ? { lng: maneuver.location[0], lat: maneuver.location[1] } : null,
  };
};

/**
 * Fetches full route directions from OSRM.
 * @param {number} originLat
 * @param {number} originLng
 * @param {number} destLat
 * @param {number} destLng
 * @returns {{ geometry, distance, duration, steps }}
 */
export const getDirections = async (originLat, originLng, destLat, destLng) => {
  if (!originLat || !originLng || !destLat || !destLng) {
    throw new Error("All four coordinates (originLat, originLng, destLat, destLng) are required.");
  }

  let response;
  try {
    response = await axios.get(
      `https://router.project-osrm.org/route/v1/driving/${originLng},${originLat};${destLng},${destLat}`,
      {
        params: {
          overview: "full",
          geometries: "geojson",
          steps: true,
        },
        timeout: 10000, // 10-second timeout
      }
    );
  } catch (err) {
    if (err.code === "ECONNABORTED") {
      throw new Error("OSRM request timed out. Please try again.");
    }
    throw new Error(`OSRM request failed: ${err.message}`);
  }

  const data = response.data;

  if (!data.routes || data.routes.length === 0) {
    throw new Error("No route found between the provided coordinates.");
  }

  const route = data.routes[0];

  // Collect all steps from all legs (typically one leg for A→B routes)
  const rawSteps = route.legs?.flatMap((leg) => leg.steps || []) || [];

  const steps = rawSteps.map((step) => buildInstruction(step));

  return {
    geometry: route.geometry?.coordinates || [], // [[lng, lat], ...] GeoJSON format
    distance: route.distance,   // meters
    duration: route.duration,   // seconds
    steps,                     // parsed turn-by-turn instructions
  };
};
