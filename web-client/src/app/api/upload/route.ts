import { NextResponse, NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Order } from '../../../lib/types';

// File paths
const ENGINE_DIR = path.resolve(process.cwd(), '../../oro/engine');
const INPUT_FILE_PATH = path.join(ENGINE_DIR, 'src/input/orders.json');

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      );
    }
    
    // Read file content
    const fileContent = await file.text();
    
    try {
      // Validate it's valid JSON and has the expected structure
      const newOrders = JSON.parse(fileContent);
      
      // Basic validation - ensure it's an array of orders
      if (!Array.isArray(newOrders)) {
        return NextResponse.json(
          { success: false, message: 'Invalid file format. Expected array of orders.' },
          { status: 400 }
        );
      }
      
      // Read existing orders file if it exists
      let existingOrders: Order[] = [];
      if (fs.existsSync(INPUT_FILE_PATH)) {
        try {
          const existingData = fs.readFileSync(INPUT_FILE_PATH, 'utf8');
          existingOrders = JSON.parse(existingData);
          
          if (!Array.isArray(existingOrders)) {
            existingOrders = []; // Reset if not an array
          }
        } catch (readError) {
          console.error('Error reading existing orders file:', readError);
          // Continue with empty array if there's an error reading the file
        }
      }
      
      // Combine existing and new orders
      const combinedOrders = [...existingOrders, ...newOrders];
      
      // Write combined orders back to the file
      fs.writeFileSync(INPUT_FILE_PATH, JSON.stringify(combinedOrders, null, 2));
      
      return NextResponse.json({
        success: true,
        message: 'Orders appended successfully',
        totalOrders: combinedOrders.length
      });
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid JSON file' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process upload' },
      { status: 500 }
    );
  }
} 