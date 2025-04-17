import { NextResponse, NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Order } from '../../../lib/types';

const ENGINE_DIR = path.resolve(process.cwd(), '../../oro/engine');
const INPUT_FILE_PATH = path.join(ENGINE_DIR, 'src/input/orders.json');

export async function GET() {
  try {
    console.log(`Attempting to read orders from: ${INPUT_FILE_PATH}`);
    
    if (!fs.existsSync(INPUT_FILE_PATH)) {
      console.error(`Orders file not found at path: ${INPUT_FILE_PATH}`);
      return NextResponse.json([]);
    }

    const fileContents = fs.readFileSync(INPUT_FILE_PATH, 'utf8');
    
    try {
      const orders = JSON.parse(fileContents);
      
      if (!Array.isArray(orders)) {
        console.error('Invalid orders structure: not an array');
        return NextResponse.json([]);
      }
      
      console.log(`Successfully parsed orders - Count: ${orders.length}`);
      
      return NextResponse.json(orders);
    } catch (parseError) {
      console.error('Error parsing orders JSON:', parseError);
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error('Error reading orders file:', error);
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const newOrder = await request.json();
    
    let orders: Order[] = [];
    if (fs.existsSync(INPUT_FILE_PATH)) {
      try {
        const fileContents = fs.readFileSync(INPUT_FILE_PATH, 'utf8');
        const parsedOrders = JSON.parse(fileContents);
        if (Array.isArray(parsedOrders)) {
          orders = parsedOrders;
        } else {
          console.error('Existing orders file is not an array');
        }
      } catch (readError) {
        console.error('Error reading existing orders:', readError);
      }
    }
    
    if (!newOrder.order_id) {
      newOrder.order_id = Math.floor(Math.random() * 10000).toString();
    }
    
    orders.push(newOrder);
    
    fs.writeFileSync(INPUT_FILE_PATH, JSON.stringify(orders, null, 2));
    console.log(`Successfully saved new order with ID: ${newOrder.order_id}`);
    
    return NextResponse.json(newOrder);
  } catch (error) {
    console.error('Error saving order:', error);
    return NextResponse.json(
      { error: 'Failed to save order' },
      { status: 500 }
    );
  }
}