import fs from 'node:fs';
import * as jose from 'jose';

export interface AuthCredentials {
  keyId: string;
  issuerId: string;
  keyPath?: string;
  privateKey?: string;
}

let cachedToken: string | null = null;
let tokenExpiry = 0;

export async function generateToken(credentials: AuthCredentials): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && tokenExpiry > now + 60) {
    return cachedToken;
  }

  const privateKeyPem = credentials.privateKey || fs.readFileSync(credentials.keyPath!, 'utf-8');
  const privateKey = await jose.importPKCS8(privateKeyPem, 'ES256');

  const jwt = await new jose.SignJWT({})
    .setProtectedHeader({
      alg: 'ES256',
      kid: credentials.keyId,
      typ: 'JWT',
    })
    .setIssuer(credentials.issuerId)
    .setIssuedAt(now)
    .setExpirationTime(now + 1200) // 20 minutes
    .setAudience('appstoreconnect-v1')
    .sign(privateKey);

  cachedToken = jwt;
  tokenExpiry = now + 1200;

  return jwt;
}

export function clearTokenCache(): void {
  cachedToken = null;
  tokenExpiry = 0;
}
