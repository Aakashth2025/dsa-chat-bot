import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        role: String,
        text: String
    }
);

const chatSchema = new mongoose.Schema(
    {
        title:{
            type: String,
            default: "New Chat"
        },
        messages: [messageSchema]
    },
    {
        timestamps: true
    }
);

const ChatModel = mongoose.model("Chat", chatSchema);
export default ChatModel;