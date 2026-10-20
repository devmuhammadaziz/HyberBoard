export const config = {
  port: Number(process.env.PORT || 3001),
  mongodbUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/hyperboard",
  openaiApiKey: process.env.OPENAI_API_KEY || "",
  openaiModel: process.env.OPENAI_MODEL || "gpt-4o",
  jwtSecret: process.env.JWT_SECRET || "hyperboard-dev-secret-change-me",
  googleClientId: process.env.GOOGLE_CLIENT_ID || "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  webOrigin: process.env.WEB_ORIGIN || "http://localhost:4000",
  consoleOrigin: process.env.CONSOLE_ORIGIN || "http://localhost:3002",
  adminSecretKey: process.env.ADMIN_SECRET_KEY || "admin-dev-secret",
  adminUsername: process.env.ADMIN_USERNAME || "admin",
  adminPassword: process.env.ADMIN_PASSWORD || "demo1234",
  r2: {
    accountId: process.env.R2_ACCOUNT_ID || "",
    endpoint: process.env.R2_ENDPOINT || process.env.CLOUDFLARE_R2_ENDPOINT || "",
    accessKeyId: process.env.R2_ACCESS_KEY_ID || process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || "",
    secretAccessKey:
      process.env.R2_SECRET_ACCESS_KEY || process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || "",
    bucketName: process.env.R2_BUCKET_NAME || process.env.CLOUDFLARE_R2_BUCKET_NAME || "",
    publicBaseUrl: process.env.R2_PUBLIC_BASE_URL || "",
  },
};
