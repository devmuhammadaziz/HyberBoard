import mongoose, { Schema, type InferSchemaType } from "mongoose";

const UserSchema = new Schema(
  {
    googleId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    avatarUrl: { type: String },
    locale: { type: String, enum: ["en", "ru", "kk"], default: "en" },
    theme: { type: String, enum: ["light", "dark"], default: "dark" },
    subjects: {
      type: [String],
      enum: ["math", "physics", "chemistry"],
      default: [],
    },
    institution: { type: String },
    role: {
      type: String,
      enum: ["teacher", "professor", "tutor", "student"],
    },
    onboarded: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export type UserDoc = InferSchemaType<typeof UserSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const User = mongoose.models.User || mongoose.model("User", UserSchema);
