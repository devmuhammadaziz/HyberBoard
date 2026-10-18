import type { BoardDoc } from "../models/Board";
import type { SessionHistoryDoc } from "../models/SessionHistory";
import type { UserDoc } from "../models/User";

export function serializeUser(user: UserDoc) {
  return {
    id: String(user._id),
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
    locale: user.locale,
    theme: user.theme,
    subjects: user.subjects,
    institution: user.institution,
    role: user.role,
    onboarded: user.onboarded,
    createdAt: (user as { createdAt?: Date }).createdAt?.toISOString?.() ?? new Date().toISOString(),
    updatedAt: (user as { updatedAt?: Date }).updatedAt?.toISOString?.() ?? new Date().toISOString(),
  };
}

export function serializeBoard(board: BoardDoc) {
  return {
    id: String(board._id),
    userId: String(board.userId),
    title: board.title,
    subject: board.subject,
    elements: board.elements ?? [],
    viewport: board.viewport ?? { x: 0, y: 0, zoom: 1 },
    createdAt: (board as { createdAt?: Date }).createdAt?.toISOString?.() ?? new Date().toISOString(),
    updatedAt: (board as { updatedAt?: Date }).updatedAt?.toISOString?.() ?? new Date().toISOString(),
  };
}

export function serializeHistory(entry: SessionHistoryDoc) {
  return {
    id: String(entry._id),
    userId: String(entry.userId),
    boardId: String(entry.boardId),
    title: entry.title,
    subject: entry.subject,
    summary: entry.summary,
    searchableText: entry.searchableText,
    elementCount: entry.elementCount,
    thumbnailUrl: entry.thumbnailUrl,
    status: (entry as { status?: "active" | "deleted" }).status || "active",
    createdAt: (entry as { createdAt?: Date }).createdAt?.toISOString?.() ?? new Date().toISOString(),
    updatedAt: (entry as { updatedAt?: Date }).updatedAt?.toISOString?.() ?? new Date().toISOString(),
  };
}
