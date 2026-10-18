import { createRemoteJWKSet, jwtVerify } from "jose";
import { SignJWT, jwtVerify as localVerify } from "jose";
import { config } from "../config";
import { User, type UserDoc } from "../models/User";

const googleJwks = createRemoteJWKSet(
  new URL("https://www.googleapis.com/oauth2/v3/certs")
);

export async function verifyGoogleIdToken(idToken: string) {
  const { payload } = await jwtVerify(idToken, googleJwks, {
    issuer: ["https://accounts.google.com", "accounts.google.com"],
    audience: config.googleClientId,
  });

  if (!payload.sub || !payload.email) {
    throw new Error("Invalid Google token payload");
  }

  return {
    googleId: payload.sub,
    email: String(payload.email),
    name: String(payload.name || payload.email),
    avatarUrl: payload.picture ? String(payload.picture) : undefined,
  };
}

export async function findOrCreateGoogleUser(profile: {
  googleId: string;
  email: string;
  name: string;
  avatarUrl?: string;
}): Promise<UserDoc> {
  let user = await User.findOne({ googleId: profile.googleId });
  if (!user) {
    user = await User.create({
      googleId: profile.googleId,
      email: profile.email,
      name: profile.name,
      avatarUrl: profile.avatarUrl,
      onboarded: false,
      subjects: [],
      locale: "en",
      theme: "dark",
    });
  } else {
    user.name = profile.name;
    user.avatarUrl = profile.avatarUrl;
    await user.save();
  }
  return user as UserDoc;
}

export async function signAppToken(userId: string) {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(new TextEncoder().encode(config.jwtSecret));
}

export async function verifyAppToken(token: string) {
  const { payload } = await localVerify(
    token,
    new TextEncoder().encode(config.jwtSecret)
  );
  if (!payload.sub) throw new Error("Invalid token");
  return String(payload.sub);
}

export async function getUserFromAuthHeader(authHeader?: string | null) {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  try {
    const userId = await verifyAppToken(token);
    const user = await User.findById(userId);
    return (user as UserDoc | null) ?? null;
  } catch {
    return null;
  }
}
