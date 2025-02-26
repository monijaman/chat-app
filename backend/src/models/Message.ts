import mongoose, { Document, Schema } from "mongoose";

interface IMessage extends Document {
  username: string;
  text: string;
  topic: string; // Add topic field
  timestamp: Date;
}

const messageSchema: Schema = new Schema(
  {
    username: { type: String, required: true },
    text: { type: String, required: true },
    topic: { type: String, required: true }, // Ensure the topic is stored
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Message = mongoose.model<IMessage>("Message", messageSchema);

export default Message;
