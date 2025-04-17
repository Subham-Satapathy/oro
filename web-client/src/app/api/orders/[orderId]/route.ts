import { NextResponse, NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Order } from '../../../../lib/types';

// File paths
const ENGINE_DIR = path.resolve(process.cwd(), '../../oro/engine');
const INPUT_FILE_PATH = path.join(ENGINE_DIR, 'src/input/orders.json');

export async function DELETE(
  request: NextRequest,
  context: { params: { orderId: string } }
) {
  try {
    const params = await context.params;
    const orderId = params.orderId;
    console.log(`Attempting to delete order with ID: ${orderId}`);

    // Check if file exists
    if (!fs.existsSync(INPUT_FILE_PATH)) {
      console.error(`Orders file not found at path: ${INPUT_FILE_PATH}`);
      return NextResponse.json(
        { success: false, error: 'Orders file not found' },
        { status: 404 }
      );
    }

    // Read existing orders
    try {
      const fileContents = fs.readFileSync(INPUT_FILE_PATH, 'utf8');
      let orders: Order[];
      
      try {
        const parsedOrders = JSON.parse(fileContents);
        
        if (!Array.isArray(parsedOrders)) {
          console.error('Invalid orders structure: not an array');
          return NextResponse.json(
            { success: false, error: 'Invalid orders format' },
            { status: 500 }
          );
        }
        
        orders = parsedOrders;
      } catch (parseError) {
        console.error('Error parsing orders JSON:', parseError);
        return NextResponse.json(
          { success: false, error: 'Failed to parse orders file' },
          { status: 500 }
        );
      }

      // Filter out the order to delete
      const updatedOrders = orders.filter(order => order.order_id !== orderId);

      // If the lengths are the same, the order wasn't found
      if (orders.length === updatedOrders.length) {
        console.log(`Order with ID ${orderId} not found`);
        return NextResponse.json(
          { success: false, error: 'Order not found' },
          { status: 404 }
        );
      }

      // Write back to file
      fs.writeFileSync(INPUT_FILE_PATH, JSON.stringify(updatedOrders, null, 2));
      console.log(`Successfully deleted order with ID: ${orderId}`);

      return NextResponse.json({ success: true });
    } catch (readError) {
      console.error('Error reading orders file:', readError);
      return NextResponse.json(
        { success: false, error: 'Failed to read orders file' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete order' },
      { status: 500 }
    );
  }
} 