const { findById } = require("../services/apikey.service");

const HEADER = {
  API_KEY: "x-api-key",
  AUTHORIZATION: "authorization",
};

const apiKey = async (req, res, next) => {
  try {
    // Kiểm tra xem request đến từ địa chỉ nào
    const requestUrl = req.protocol + "://" + req.get("host");

    console.log({ requestUrl });

    // Nếu địa chỉ là http://localhost:3056/, bỏ qua việc kiểm tra API key
    if (requestUrl === "http://localhost:3056") {
      console.log("abcxbcbcb");
      return next();
    }

    // Kiểm tra API key nếu request đến từ các địa chỉ khác
    const key = req.headers[HEADER.API_KEY]?.toString();
    if (!key) {
      return res.status(403).json({
        msg: "Forbidden Error",
      });
    }

    const objKey = await findById(key);

    if (!objKey) {
      return res.status(403).json({
        msg: "Forbidden Error",
      });
    }
    req.objKey = objKey;

    return next();
  } catch (error) {
    // Xử lý lỗi nếu có
    console.error(error);
    return res.status(500).json({
      msg: "Internal Server Error",
    });
  }
};

const permission = (permission) => {
  return (req, res, next) => {
    const requestUrl = req.protocol + "://" + req.get("host");

    console.log({ requestUrl });

    // Nếu địa chỉ là http://localhost:3056/, bỏ qua việc kiểm tra API key
    if (requestUrl === "http://localhost:3056") {
      console.log("abcxbcbcb");
      return next();
    }

    if (!req.objKey.permissions) {
      return res.status(403).json({
        msg: "Permission dinied",
      });
    }

    const validPermission = req.objKey.permissions.includes(permission);
    if (!validPermission) {
      return res.status(403).json({
        msg: "Permission dinied",
      });
    }

    return next();
  };
};

module.exports = {
  apiKey,
  permission,
};
