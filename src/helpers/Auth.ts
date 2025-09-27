import {
  createHmac as cryptoCreateHmac,
  randomBytes,
  timingSafeEqual,
} from "crypto";
/**
 * Verifies the signature of a request.
 * @param secret - The secret used to create the HMAC.
 * @param body - The body of the request.
 * @param signatureHeader - The signature header from the request.
 * @returns True if the signature is valid, false otherwise.
 */
export const verifySignature = (
  secret: string,
  body: string,
  signatureHeader?: string
): boolean => {
  if (!signatureHeader) return false;
  const signature = signatureHeader.replace("sha256=", "");
  const hmac = createHmac("sha256", secret).update(body).digest("hex");

  try {
    return timingSafeEqual(
      Buffer.from(hmac, "hex"),
      Buffer.from(signature, "hex")
    );
  } catch {
    return false;
  }
};

/** Generates a random state string.
 * @param length - The length of the state string.
 * @returns A random state string.
 */
export const generateState = (length: number = 16): string => {
  return randomBytes(length).toString("hex");
};
/**
 * Creates an HMAC.
 * @param algorithm - The hashing algorithm to use.
 * @param secret - The secret key to use for the HMAC.
 * @returns The HMAC object.
 */
const createHmac = (algorithm: string, secret: string) => {
  return cryptoCreateHmac(algorithm, secret);
};
