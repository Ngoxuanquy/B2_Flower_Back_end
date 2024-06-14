const chatService = require('../services/chat.service');

module.exports = (socket, io) => {
    console.log('New client connected');

    socket.on('sendMessage', (data) => {
        chatService.handleMessage(socket, io, data);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
};
