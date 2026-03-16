import { gateAddressCordinate, getDistanceTime, searchPlaces, getDistanceTimeForCoordinates } from "../services/map.service.js";

export const getDistanceTimeController = async (req, res) => {

  const { origin, destination } = req.query;

  if (!origin || !destination) {
    return res.status(400).json({
      message: "Origin and destination are required"
    });
  }

  try {

    const originCoords = await gateAddressCordinate(origin);
    const destinationCoords = await gateAddressCordinate(destination);

    const distanceData = await getDistanceTime(originCoords, destinationCoords);

    res.status(200).json(distanceData);

  } catch (error) {

    res.status(500).json({
      message: "Failed to calculate distance"
    });

  }
};

export const searchLocationController = async (req, res) => {

  const { input } = req.query;

  if (!input) {
    return res.status(400).json({
      message: "Search input required"
    });
  }

  try {

    const results = await searchPlaces(input);

    res.status(200).json(results);

  } catch (error) {
    res.status(500).json({
      message: "Failed to search locations"
    });
  }

};

export const getCoordinatesController = async (req, res) => {
  const { address } = req.query;

  if (!address) {
    return res.status(400).json({ message: "Address is required" });
  }

  try {
    const coords = await gateAddressCordinate(address);
    res.status(200).json(coords);
  } catch (error) {
    res.status(500).json({ message: "Failed to get coordinates" });
  }
};

export const getDistanceTimeCoordsController = async (req, res) => {
  const { originLat, originLng, destLat, destLng } = req.query;

  if (!originLat || !originLng || !destLat || !destLng) {
    return res.status(400).json({ message: "originLat, originLng, destLat, and destLng are required" });
  }

  try {
    const originCoords = { lat: parseFloat(originLat), lng: parseFloat(originLng) };
    const destinationCoords = { lat: parseFloat(destLat), lng: parseFloat(destLng) };

    const distanceData = await getDistanceTimeForCoordinates(originCoords, destinationCoords);
    res.status(200).json(distanceData);
  } catch (error) {
    res.status(500).json({ message: "Failed to calculate distance for coordinates" });
  }
};