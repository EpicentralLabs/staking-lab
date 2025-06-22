import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { apy } = await request.json();
    const numericApy = Number(apy);
    
    if (isNaN(numericApy) || numericApy < 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid APY value' },
        { status: 400 }
      );
    }

    // Path to constants.ts file
    const constantsFilePath = path.join(process.cwd(), 'src', 'lib', 'constants.ts');
    
    // Read the current file content
    let fileContent = fs.readFileSync(constantsFilePath, 'utf8');
    
    // Replace the APY value using regex
    const updatedContent = fileContent.replace(
      /export const STAKE_APY = \d+(\.\d+)?;.*$/m,
      `export const STAKE_APY = ${numericApy}; // ${numericApy}% APY`
    );
    
    // Write the updated content back to the file
    fs.writeFileSync(constantsFilePath, updatedContent, 'utf8');
    
    return NextResponse.json({ 
      success: true, 
      message: 'APY updated successfully',
      newApy: numericApy 
    });
  } catch (error) {
    console.error('Error updating APY:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update APY' },
      { status: 500 }
    );
  }
} 