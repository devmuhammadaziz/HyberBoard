import { Elysia } from "elysia";
import { config } from "../config";
import { User } from "../models/User";
import { Board } from "../models/Board";
import { SessionHistory } from "../models/SessionHistory";

export const adminRoutes = new Elysia({ prefix: "/admin" }).get(
  "/stats",
  async ({ request, set }) => {
    const key = request.headers.get("x-admin-key");
    if (key !== config.adminSecretKey) {
      set.status = 401;
      return { error: "Unauthorized" };
    }
    const [users, boards, sessions, recentUsers] = await Promise.all([
      User.countDocuments(),
      Board.countDocuments(),
      SessionHistory.countDocuments(),
      User.find().sort({ createdAt: -1 }).limit(20).select("name email onboarded subjects createdAt"),
    ]);
    return {
      users,
      boards,
      sessions,
      recentUsers: recentUsers.map((u) => ({
        id: String(u._id),
        name: u.name,
        email: u.email,
        onboarded: u.onboarded,
        subjects: u.subjects,
        createdAt: (u as { createdAt?: Date }).createdAt,
      })),
    };
  }
);
