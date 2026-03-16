import { Server } from "socket.io";
import userModel from "./models/user.model.js";
import riderModel from "./models/rider.model.js";
import rideModel from "./models/ride.model.js";

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on("join", async ({ userId, userType }) => {
      if (userType === "user") {
        await userModel.findByIdAndUpdate(userId, { soketId: socket.id });
      } else if (userType === "rider") {
        await riderModel.findByIdAndUpdate(userId, { soketId: socket.id });
      }
    });

    socket.on("update-location-rider", async ({ userId, location }) => {
      console.log("update-location-rider received:", userId, location);

      if (!location || !location.lat || !location.lng) return;

      try {
        await riderModel.findByIdAndUpdate(userId, {
          location: {
            type: "Point",
            coordinates: [location.lng, location.lat], // ⚠️ lng first
          },
        });

        const activeRide = await rideModel.findOne({
            rider: userId,
            status: { $in: ['accepted', 'ongoing'] }
        }).populate('user');

        if (activeRide && activeRide.user && activeRide.user.soketId) {
            sendMessageToSocketId(activeRide.user.soketId, {
                event: 'rider-location-update',
                data: location
            });
        }

        console.log("Rider location updated:", userId);
      } catch (error) {
        console.log("Error updating rider location:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
};

export const sendMessageToSocketId = (socketId, messageObject) => {
  if (io) {
    io.to(socketId).emit(messageObject.event, messageObject.data);
  } else {
    console.log("Socket is not initialized.");
  }
};
