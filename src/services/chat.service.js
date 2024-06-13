const { NotFoundError } = require("../core/error.response");
const { contact } = require("../models/contact.model");
// const { getProductById } = require('../models/repositories/product.repo')
const express = require("express");
const { createServer } = require("node:http");
const { Server } = require("socket.io");

const app = express();
const server = createServer(app);
const io = new Server(server);

class ChatService {
  static async SocketIo(payload) {
    try {
      //   socket.io
      io.on("connection", (socket) => {
        console.log("a user connected");
        socket.on("message", (message) => {
          io.emit("message", message);
        });
        socket.on("disconnect", () => {
          console.log("user disconnected");
        });
      });
    } catch (error) {
      console.error(error);
      throw new Error("Failed to create or update user transaction.");
    }
  }
}

module.exports = ChatService;
