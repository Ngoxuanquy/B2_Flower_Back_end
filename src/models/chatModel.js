const { model, Schema } = require('mongoose');

const DOCUMENT_NAME = 'Chat';
const COLLECTION_NAME = 'Chats';

const ContactSchema = new Schema(
    {
        userId: { type: String, required: true },
        sender: { type: String, required: true },
        receiver: { type: String, required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
    },
    {
        collection: COLLECTION_NAME,
        timestamps: {
            createdAt: 'createdOn',
            updatedAt: 'modifieOn',
        },
    },
);

module.exports = {
    contact: model(DOCUMENT_NAME, ContactSchema),
};
