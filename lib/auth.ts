import { jwtVerify, SignJWT } from "jose";
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";
const AUTH_USERNAME = process.env.AUTH_USERNAME || "";
const AUTH_PASSWORD_HASH = process.env.AUTH_PASSWORD_HASH || "";

// Convert secret to Uint8Array for jose
const getSecretKey = () => new TextEncoder().encode(JWT_SECRET);

/**
 * Hash a password using SHA-256
 */
export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

/**
 * Verify credentials against environment variables
 */
export function verifyCredentials(email: string, password: string): boolean {
  const passwordHash = hashPassword(password);
  return email === AUTH_USERNAME && passwordHash === AUTH_PASSWORD_HASH;
}

/**
 * Generate a JWT token
 */
export async function generateToken(email: string): Promise<string> {
  const token = await new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecretKey());

  return token;
}

/**
 * Verify a JWT token
 */
export async function verifyToken(token: string): Promise<{ email: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return { email: payload.email as string };
  } catch (error) {
    return null;
  }
}

/**
 * Get token from cookies
 */
export function getTokenFromCookies(cookies: string): string | null {
  const match = cookies.match(/auth-token=([^;]+)/);
  return match ? match[1] : null;
}
