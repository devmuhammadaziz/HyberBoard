import mongoose, { Schema, type InferSchemaType } from "mongoose";

const SessionHistorySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    boardId: { type: Schema.Types.ObjectId, ref: "Board", required: true, index: true },
    title: { type: String, required: true },
    subject: {
      type: String,
      enum: ["math", "physics", "chemistry"],
      required: true,
    },
    summary: { type: String, default: "" },
    searchableText: { type: String, default: "", index: "text" },
    elementCount: { type: Number, default: 0 },
    thumbnailUrl: { type: String },
    status: {
      type: String,
      enum: ["active", "deleted"],
      default: "active",
      index: true,
    },
    elementsSnapshot: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

SessionHistorySchema.index({ userId: 1, updatedAt: -1 });

export type SessionHistoryDoc = InferSchemaType<typeof SessionHistorySchema> & {
  _id: mongoose.Types.ObjectId;
};

export const SessionHistory =
  mongoose.models.SessionHistory ||
  mongoose.model("SessionHistory", SessionHistorySchema);
