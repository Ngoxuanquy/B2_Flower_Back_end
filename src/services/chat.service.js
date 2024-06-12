module.exports = {
    handleMessage: (socket, io, data) => {
        console.log('Message received:', data);

        // Logic xử lý message
        const processedMessage = data.message.toUpperCase(); // Ví dụ đơn giản

        // Phát lại message cho tất cả các client
        io.emit('broadcastMessage', {
            user: data.user,
            message: processedMessage,
        });
    },
};
