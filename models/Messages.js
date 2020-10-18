import mongoose from 'mongoose';

const messageSchema = mongoose.Schema({
    message: String,
    name: String,
    timeStamp: String,
    receiver: Boolean
});

const Message = mongoose.model('messages', messageSchema)

export default Message;