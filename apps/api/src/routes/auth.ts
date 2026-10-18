import { Elysia, t } from "elysia";
import {
  findOrCreateGoogleUser,
  getUserFromAuthHeader,
  signAppToken,
  verifyGoogleIdToken,
} from "../lib/auth";
import { isLocale, isRole, isSubject, isTheme } from "../lib/schema";
import { serializeUser } from "../lib/serialize";
import { User } from "../models/User";

export const authRoutes = new Elysia({ prefix: "/auth" })
  .post(
    "/google",
    async ({ body, set }) => {
      try {
        const profile = await verifyGoogleIdToken(body.idToken);
        const user = await findOrCreateGoogleUser(profile);
        const token = await signAppToken(String(user._id));
        return { token, user: serializeUser(user) };
      } catch (err) {
        set.status = 401;
        return { error: err instanceof Error ? err.message : "Auth failed" };
      }
    },
    {
      body: t.Object({ idToken: t.String() }),
    }
  )
  .get("/me", async ({ request, set }) => {
    const user = await getUserFromAuthHeader(request.headers.get("authorization"));
    if (!user) {
      set.status = 401;
      return { error: "Unauthorized" };
    }
    return { user: serializeUser(user) };
  })
  .patch(
    "/onboarding",
    async ({ request, body, set }) => {
      const user = await getUserFromAuthHeader(request.headers.get("authorization"));
      if (!user) {
        set.status = 401;
        return { error: "Unauthorized" };
      }

      const subjects = Array.isArray(body.subjects)
        ? body.subjects.filter(isSubject)
        : [];
      if (!subjects.length || !isRole(body.role) || !isLocale(body.locale)) {
        set.status = 400;
        return { error: "Invalid onboarding payload" };
      }

      const updated = await User.findByIdAndUpdate(
        user._id,
        {
          subjects,
          institution: body.institution,
          role: body.role,
          locale: body.locale,
          onboarded: true,
        },
        { new: true }
      );
      return { user: serializeUser(updated as typeof user) };
    },
    {
      body: t.Object({
        subjects: t.Array(t.String()),
        institution: t.Optional(t.String()),
        role: t.String(),
        locale: t.String(),
      }),
    }
  )
  .patch(
    "/preferences",
    async ({ request, body, set }) => {
      const user = await getUserFromAuthHeader(request.headers.get("authorization"));
      if (!user) {
        set.status = 401;
        return { error: "Unauthorized" };
      }

      const patch: Record<string, string> = {};
      if (body.theme !== undefined) {
        if (!isTheme(body.theme)) {
          set.status = 400;
          return { error: "Invalid theme" };
        }
        patch.theme = body.theme;
      }
      if (body.locale !== undefined) {
        if (!isLocale(body.locale)) {
          set.status = 400;
          return { error: "Invalid locale" };
        }
        patch.locale = body.locale;
      }

      const updated = await User.findByIdAndUpdate(user._id, patch, { new: true });
      return { user: serializeUser(updated as typeof user) };
    },
    {
      body: t.Object({
        theme: t.Optional(t.String()),
        locale: t.Optional(t.String()),
      }),
    }
  );
