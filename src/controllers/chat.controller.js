const { SuccessResponse } = require("../core/success.response");
const ChatService = require("../services/chat.service");

class ChatController {
  static async SocketIo(req, res, next) {
    new SuccessResponse({
      message: "success",
      metadata: await ChatService.SocketIo(),
    }).send(res);
  }
}

module.exports = ChatController;
