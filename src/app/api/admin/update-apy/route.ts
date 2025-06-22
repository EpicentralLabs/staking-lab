import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import nacl from 'tweetnacl';
import bs58 from 'bs58';

export async function POST(req: Request) {
  try {
    const { apy, publicKey, message, signature } = await req.json();

    if (typeof apy !== 'number' || apy < 0 || !publicKey || !message || !signature) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const adminPublicKey = process.env.ADMIN_PUBLIC_KEY;
    if (!adminPublicKey) {
        console.error("ADMIN_PUBLIC_KEY is not set in environment variables.");
        return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    if (publicKey !== adminPublicKey) {
        return NextResponse.json({ error: "Unauthorized: Invalid public key" }, { status: 401 });
    }

    const messageBytes = new TextEncoder().encode(message);
    const publicKeyBytes = bs58.decode(publicKey);
    const signatureBytes = bs58.decode(signature);

    const isVerified = nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);

    if (!isVerified) {
        return NextResponse.json({ error: 'Unauthorized: Invalid signature' }, { status: 401 });
    }

    const filePath = path.join(process.cwd(), 'src', 'lib', 'constants.ts');
    const fileContent = await fs.readFile(filePath, 'utf-8');

    const newContent = fileContent.replace(
      /export const STAKE_APY = \d+(\.\d+)?;/,
      `export const STAKE_APY = ${apy};`
    );

    await fs.writeFile(filePath, newContent, 'utf-8');

    return NextResponse.json({ message: 'APY updated successfully' });
  } catch (error) {
    console.error('Error updating APY:', error);
    return NextResponse.json({ error: 'Failed to update APY' }, { status: 500 });
  }
} 