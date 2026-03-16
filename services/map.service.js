import axios from "axios";
import riderModel from "../models/rider.model.js";

export const gateAddressCordinate = async (address) => {
  
  try {
    const response = await axios.get(
      "https://nominatim.openstreetmap.org/search",
      {
        params: {
          q: address,
          format: "json",
          limit: 1
        },
        headers: {
          "User-Agent": "uber-clone-app" // required by Nominatim
        }
      }
    );

    const data = response.data;

    if (!data || data.length === 0) {
      throw new Error("Address not found");
    }

    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon)
    };

  } catch (error) {
    console.error("Geocoding error:", error.message);
    throw error;
  }
};

export const getDistanceTime = async (origin, destination) => {
 
  try {
    if (!origin || !destination) {
      throw new Error("Origin or destination missing");
    }

    
    const originLngLat = await gateAddressCordinate(origin);
    const destinationLngLat = await gateAddressCordinate(destination);

    const response = await axios.get(
      `https://router.project-osrm.org/route/v1/driving/${originLngLat.lng},${originLngLat.lat};${destinationLngLat.lng},${destinationLngLat.lat}`,
      {
        params: {
          overview: "false"
        }
      }
    );

    const data = response.data;
  
    if (!data.routes || data.routes.length === 0) {
      throw new Error("Route not found");
    }

    const route = data.routes[0];

    return {
      distance: route.distance, // meters
      duration: route.duration  // seconds
    };

  } catch (error) {
    console.error("Error getting distance and time:", error.message);
    throw error;
  }
};

export const searchPlaces = async (query) => {

  const response = await axios.get(
    "https://nominatim.openstreetmap.org/search",
    {
      params: {
        q: query,
        format: "json",
        addressdetails: 1,
        limit: 5
      },
      headers: {
        "User-Agent": "uber-clone-app"
      }
    }
  );

  const data = response.data;

  return data.map(place => ({
    name: place.display_name,
    lat: place.lat,
    lng: place.lon
  }));
};

export const getNearbyRiders = async (lat, lng, radius)=>{

  const riders = await riderModel.find({
    location:{
      $near:{
        $geometry:{
          type:"Point",
          coordinates:[lng,lat]
        },
        $maxDistance:radius || 5000
      }
    }
  }).limit(10);

  

  return riders;
}

export const getDistanceTimeForCoordinates = async (originObj, destinationObj) => {
  try {
    if (!originObj || !destinationObj || !originObj.lat || !originObj.lng || !destinationObj.lat || !destinationObj.lng) {
      throw new Error("Invalid coordinate objects for origin or destination");
    }

    const response = await axios.get(
      `https://router.project-osrm.org/route/v1/driving/${originObj.lng},${originObj.lat};${destinationObj.lng},${destinationObj.lat}`,
      {
        params: {
          overview: "simplified",
          geometries: "geojson"
        }
      }
    );

    const data = response.data;
  
    if (!data.routes || data.routes.length === 0) {
      throw new Error("Route not found");
    }

    const route = data.routes[0];

    return {
      distance: route.distance, // meters
      duration: route.duration, // seconds
      geometry: route.geometry?.coordinates // [lng, lat][]
    };

  } catch (error) {
    console.error("Error getting distance and time for coords:", error.message);
    throw error;
  }
};