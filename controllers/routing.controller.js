import { getDirections } from "../services/routing.service.js";

/**
 * GET /api/directions
 * Query params: originLat, originLng, destLat, destLng
 */
export const getDirectionsController = async (req, res) => {
  try {
    const { originLat, originLng, destLat, destLng } = req.query;

    // Validate all four required coordinates
    if (!originLat || !originLng || !destLat || !destLng) {
      return res.status(400).json({
        message: "Missing required query params: originLat, originLng, destLat, destLng",
      });
    }

    const origin = {
      lat: parseFloat(originLat),
      lng: parseFloat(originLng),
    };
    const dest = {
      lat: parseFloat(destLat),
      lng: parseFloat(destLng),
    };

    if (isNaN(origin.lat) || isNaN(origin.lng) || isNaN(dest.lat) || isNaN(dest.lng)) {
      return res.status(400).json({ message: "Coordinates must be valid numbers." });
    }

    const result = await getDirections(origin.lat, origin.lng, dest.lat, dest.lng);

    return res.status(200).json({
      geometry: result.geometry,       // [[lng, lat], …] GeoJSON
      distance: result.distance,       // meters
      duration: result.duration,       // seconds
      steps: result.steps,             // [{ instruction, distance, duration, type, modifier, coordinate }, …]
    });
  } catch (error) {
    console.error("Error in getDirectionsController:", error.message);
    const status = error.message.includes("timed out") ? 504 : 500;
    return res.status(status).json({ message: error.message || "Failed to get directions." });
  }
};
