import mongoose, { Schema, type InferSchemaType } from "mongoose";

const PointSchema = new Schema(
  { x: Number, y: Number },
  { _id: false }
);

const StyleSchema = new Schema(
  {
    color: { type: String, default: "#4F46E5" },
    width: { type: Number, default: 2 },
    opacity: { type: Number, default: 1 },
  },
  { _id: false }
);

const ElementSchema = new Schema(
  {
    id: { type: String, required: true },
    type: { type: String, required: true },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    width: Number,
    height: Number,
    points: [PointSchema],
    text: String,
    latex: String,
    rotation: Number,
    style: { type: StyleSchema, required: true },
    subject: String,
    featureId: String,
    meta: Schema.Types.Mixed,
    createdAt: Number,
    updatedAt: Number,
  },
  { _id: false }
);

const BoardSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, default: "Untitled Board" },
    subject: {
      type: String,
      enum: ["math", "physics", "chemistry"],
      default: "math",
    },
    elements: { type: [ElementSchema], default: [] },
    viewport: {
      type: new Schema(
        {
          x: { type: Number, default: 0 },
          y: { type: Number, default: 0 },
          zoom: { type: Number, default: 1 },
        },
        { _id: false }
      ),
      default: () => ({ x: 0, y: 0, zoom: 1 }),
    },
    deleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

export type BoardDoc = InferSchemaType<typeof BoardSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Board = mongoose.models.Board || mongoose.model("Board", BoardSchema);
