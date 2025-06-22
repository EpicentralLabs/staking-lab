import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { apy } = await req.json();

    if (typeof apy !== 'number' || apy < 0) {
      return NextResponse.json({ error: 'Invalid APY value' }, { status: 400 });
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