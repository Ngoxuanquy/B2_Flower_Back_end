const { authenticationV2 } = require("../../auth/authUtils");
const asyncHandler = require("../../helpers/asyncHandle");
const ChatController = require("../../controllers/chat.controller");
const express = require("express");
const router = express.Router();
const { Server } = require("socket.io");

// Tạo một server HTTP từ Express router
const server = require("http").createServer(router);

// Khởi tạo một server Socket.IO từ server HTTP
const io = new Server(server);

// Cấu hình Socket.IO
io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("message", (message) => {
    io.emit("message", message);
  });
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

// authentication

// router.get("/", ChatController.SocketIo);

module.exports = router;
