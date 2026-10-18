import { Elysia, t } from "elysia";
import { getUserFromAuthHeader } from "../lib/auth";
import { uploadBoardSnapshot } from "../lib/r2";
import { isSubject } from "../lib/schema";
import { serializeBoard, serializeHistory } from "../lib/serialize";
import { formatSessionTitle } from "../lib/session-title";
import { Board } from "../models/Board";
import { SessionHistory } from "../models/SessionHistory";

function buildSearchableText(board: {
  title?: string;
  subject?: string;
  elements?: Array<{ text?: string; latex?: string; featureId?: string }>;
}) {
  const parts = [board.title || "", board.subject || ""];
  for (const el of board.elements || []) {
    if (el.text) parts.push(el.text);
    if (el.latex) parts.push(el.latex);
    if (el.featureId) parts.push(el.featureId);
  }
  return parts.join(" ").slice(0, 8000);
}

export const boardRoutes = new Elysia({ prefix: "/boards" })
  .get("/", async ({ request, set }) => {
    const user = await getUserFromAuthHeader(request.headers.get("authorization"));
    if (!user) {
      set.status = 401;
      return { error: "Unauthorized" };
    }
    const boards = await Board.find({ userId: user._id, deleted: { $ne: true } })
      .sort({ updatedAt: -1 })
      .limit(50);
    return { boards: boards.map((b) => serializeBoard(b as never)) };
  })
  .post(
    "/",
    async ({ request, body, set }) => {
      const user = await getUserFromAuthHeader(request.headers.get("authorization"));
      if (!user) {
        set.status = 401;
        return { error: "Unauthorized" };
      }
      const subject = isSubject(body.subject)
        ? body.subject
        : user.subjects?.[0] || "math";
      const title = (body.title || "").trim() || formatSessionTitle();
      const board = await Board.create({
        userId: user._id,
        title,
        subject,
        elements: [],
        viewport: { x: 0, y: 0, zoom: 1 },
        deleted: false,
      });

      await SessionHistory.create({
        userId: user._id,
        boardId: board._id,
        title: board.title,
        subject: board.subject,
        summary: `${board.subject} · 0 objects · ${board.title}`,
        searchableText: board.title,
        elementCount: 0,
        status: "active",
      });

      return { board: serializeBoard(board as never) };
    },
    {
      body: t.Object({
        title: t.Optional(t.String()),
        subject: t.Optional(t.String()),
      }),
    }
  )
  .get("/history/search", async ({ request, query, set }) => {
    const user = await getUserFromAuthHeader(request.headers.get("authorization"));
    if (!user) {
      set.status = 401;
      return { error: "Unauthorized" };
    }
    const q = String(query.q || "").trim();
    const filter: Record<string, unknown> = {
      userId: user._id,
      status: { $ne: "deleted" },
    };
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { summary: { $regex: q, $options: "i" } },
        { searchableText: { $regex: q, $options: "i" } },
      ];
    }
    const entries = await SessionHistory.find(filter)
      .sort({ updatedAt: -1 })
      .limit(40);
    return { history: entries.map((e) => serializeHistory(e as never)) };
  })
  .patch(
    "/history/:historyId",
    async ({ request, params, body, set }) => {
      const user = await getUserFromAuthHeader(request.headers.get("authorization"));
      if (!user) {
        set.status = 401;
        return { error: "Unauthorized" };
      }
      const title = body.title?.trim();
      if (!title) {
        set.status = 400;
        return { error: "Title is required" };
      }

      const entry = await SessionHistory.findOne({
        _id: params.historyId,
        userId: user._id,
        status: { $ne: "deleted" },
      });
      if (!entry) {
        set.status = 404;
        return { error: "Session not found" };
      }

      const board = await Board.findOneAndUpdate(
        { _id: entry.boardId, userId: user._id, deleted: { $ne: true } },
        { title },
        { new: true }
      );

      entry.title = title;
      if (board) {
        entry.summary = `${board.subject} · ${(board.elements || []).length} objects · ${title}`;
        entry.searchableText = buildSearchableText({
          title,
          subject: board.subject,
          elements: board.elements as never,
        });
      } else {
        entry.summary = `${entry.subject} · ${entry.elementCount} objects · ${title}`;
        entry.searchableText = title;
      }
      await entry.save();

      return { history: serializeHistory(entry as never) };
    },
    {
      body: t.Object({
        title: t.String(),
      }),
    }
  )
  .delete("/history/:historyId", async ({ request, params, set }) => {
    const user = await getUserFromAuthHeader(request.headers.get("authorization"));
    if (!user) {
      set.status = 401;
      return { error: "Unauthorized" };
    }

    const entry = await SessionHistory.findOne({
      _id: params.historyId,
      userId: user._id,
      status: { $ne: "deleted" },
    });
    if (!entry) {
      set.status = 404;
      return { error: "Session not found" };
    }

    entry.status = "deleted";
    await entry.save();

    await Board.findOneAndUpdate(
      { _id: entry.boardId, userId: user._id },
      { deleted: true }
    );

    return { ok: true };
  })
  .post("/:id/clear", async ({ request, params, set }) => {
    const user = await getUserFromAuthHeader(request.headers.get("authorization"));
    if (!user) {
      set.status = 401;
      return { error: "Unauthorized" };
    }
    const board = await Board.findOne({
      _id: params.id,
      userId: user._id,
      deleted: { $ne: true },
    });
    if (!board) {
      set.status = 404;
      return { error: "Board not found" };
    }

    await SessionHistory.create({
      userId: user._id,
      boardId: board._id,
      title: `${board.title} (cleared)`,
      subject: board.subject,
      summary: `Deleted snapshot · ${(board.elements || []).length} objects`,
      searchableText: buildSearchableText(board),
      elementCount: (board.elements || []).length,
      status: "deleted",
      elementsSnapshot: board.elements || [],
    });

    board.elements = [];
    await board.save();

    void uploadBoardSnapshot(
      `boards/${user._id}/${board._id}/cleared-${Date.now()}.json`,
      JSON.stringify(serializeBoard(board as never))
    );

    return { board: serializeBoard(board as never) };
  })
  .get("/:id", async ({ request, params, set }) => {
    const user = await getUserFromAuthHeader(request.headers.get("authorization"));
    if (!user) {
      set.status = 401;
      return { error: "Unauthorized" };
    }
    const board = await Board.findOne({
      _id: params.id,
      userId: user._id,
      deleted: { $ne: true },
    });
    if (!board) {
      set.status = 404;
      return { error: "Board not found" };
    }
    return { board: serializeBoard(board as never) };
  })
  .put(
    "/:id",
    async ({ request, params, body, set }) => {
      const user = await getUserFromAuthHeader(request.headers.get("authorization"));
      if (!user) {
        set.status = 401;
        return { error: "Unauthorized" };
      }
      if (body.subject !== undefined && !isSubject(body.subject)) {
        set.status = 400;
        return { error: "Invalid subject" };
      }
      const board = await Board.findOneAndUpdate(
        { _id: params.id, userId: user._id, deleted: { $ne: true } },
        {
          ...(body.title !== undefined ? { title: body.title } : {}),
          ...(body.subject !== undefined ? { subject: body.subject } : {}),
          ...(body.elements !== undefined ? { elements: body.elements } : {}),
          ...(body.viewport !== undefined ? { viewport: body.viewport } : {}),
        },
        { new: true }
      );
      if (!board) {
        set.status = 404;
        return { error: "Board not found" };
      }

      const searchableText = buildSearchableText(board);
      const summary = `${board.subject} · ${(board.elements || []).length} objects · ${board.title}`;

      await SessionHistory.findOneAndUpdate(
        { boardId: board._id, userId: user._id, status: "active" },
        {
          userId: user._id,
          boardId: board._id,
          title: board.title,
          subject: board.subject,
          summary,
          searchableText,
          elementCount: (board.elements || []).length,
          status: "active",
        },
        { upsert: true, new: true }
      );

      void uploadBoardSnapshot(
        `boards/${user._id}/${board._id}/${Date.now()}.json`,
        JSON.stringify(serializeBoard(board as never))
      );

      return { board: serializeBoard(board as never) };
    },
    {
      body: t.Object({
        title: t.Optional(t.String()),
        subject: t.Optional(t.String()),
        elements: t.Optional(t.Any()),
        viewport: t.Optional(
          t.Object({
            x: t.Number(),
            y: t.Number(),
            zoom: t.Number(),
          })
        ),
      }),
    }
  );
