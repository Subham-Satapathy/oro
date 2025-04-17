import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// File paths
const ENGINE_DIR = path.resolve(process.cwd(), '../../oro/engine');
const TRADES_FILE_PATH = path.join(ENGINE_DIR, 'outputs/trades.json');

export async function GET() {
  try {
    console.log(`Attempting to read trades from: ${TRADES_FILE_PATH}`);
    
    // Check if file exists
    if (!fs.existsSync(TRADES_FILE_PATH)) {
      console.error(`Trades file not found at path: ${TRADES_FILE_PATH}`);
      // Return empty array instead of 404 for more graceful UI handling
      return NextResponse.json([]);
    }

    // Read file
    const fileContents = fs.readFileSync(TRADES_FILE_PATH, 'utf8');
    
    try {
      const trades = JSON.parse(fileContents);
      
      // Ensure it's an array
      if (!Array.isArray(trades)) {
        console.error('Invalid trades structure: not an array');
        return NextResponse.json([]);
      }
      
      console.log(`Successfully parsed trades - Count: ${trades.length}`);
      
      return NextResponse.json(trades);
    } catch (parseError) {
      console.error('Error parsing trades JSON:', parseError);
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error('Error reading trades file:', error);
    return NextResponse.json([]);
  }
} 