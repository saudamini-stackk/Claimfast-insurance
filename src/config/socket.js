const { Server } = require("socket.io");

let io;

function initSocket(server) {
  io = new Server(server, {
    cors: { origin: "*" }
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });
}

function emitClaimUpdate(data) {
  if (io) {
    io.emit("claimStatusUpdated", data);
  }
}

module.exports = { initSocket, emitClaimUpdate };
