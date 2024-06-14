require("dotenv").config();
const compression = require("compression");
const socketIo = require("socket.io");
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");

const morgan = require("morgan");
const { checkOverload } = require("./helpers/check.connect");
const chatController = require("./controllers/chatController");
const app = express();

const server = http.createServer(app);

const io = socketIo(server);

// init middlewares
app.use(cookieParser());
app.use(express.json());

app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "*", // Địa chỉ của React app
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(helmet());
app.use(compression());

// init db

require("./dbs/init.mongodb");
// checkOverload()

// init routes
app.use("/", require("./routes"));

app.use((req, res, next) => {
  const error = new Error("Not Found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  const statusCode = error.status || 500;
  res.status(statusCode).json({
    status: "error",
    code: statusCode,
    stack: error.stack,
    message: error.message || "Internal Server Error",
  });
});

module.exports = app;
