import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// File paths
const ENGINE_DIR = path.resolve(process.cwd(), '../../oro/engine');
const ORDERBOOK_FILE_PATH = path.join(ENGINE_DIR, 'outputs/orderbook.json');

export async function GET() {
  try {
    console.log(`Attempting to read orderbook from: ${ORDERBOOK_FILE_PATH}`);
    
    // Check if file exists
    if (!fs.existsSync(ORDERBOOK_FILE_PATH)) {
      console.error(`Orderbook file not found at path: ${ORDERBOOK_FILE_PATH}`);
      // Return empty arrays instead of 404 for more graceful UI handling
      return NextResponse.json({ buy: [], sell: [] });
    }

    // Read file
    const fileContents = fs.readFileSync(ORDERBOOK_FILE_PATH, 'utf8');
    
    try {
      const orderbook = JSON.parse(fileContents);
      
      // Ensure the structure is correct
      if (!orderbook || typeof orderbook !== 'object') {
        console.error('Invalid orderbook structure: not an object');
        return NextResponse.json({ buy: [], sell: [] });
      }
      
      // Ensure buy and sell properties exist and are arrays
      const responseBuy = Array.isArray(orderbook.buy) ? orderbook.buy : [];
      const responseSell = Array.isArray(orderbook.sell) ? orderbook.sell : [];
      
      console.log(`Successfully parsed orderbook - Buy orders: ${responseBuy.length}, Sell orders: ${responseSell.length}`);
      
      return NextResponse.json({
        buy: responseBuy,
        sell: responseSell
      });
    } catch (parseError) {
      console.error('Error parsing orderbook JSON:', parseError);
      return NextResponse.json({ buy: [], sell: [] });
    }
  } catch (error) {
    console.error('Error reading orderbook file:', error);
    return NextResponse.json(
      { error: 'Failed to read orderbook file' },
      { status: 500 }
    );
  }
} 