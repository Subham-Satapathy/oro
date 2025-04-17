import { OrderController } from './controllers/OrderController';
import { Order } from './models/Order';
import { serve } from 'bun';

const controller = new OrderController();

const server = serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);
    
    // Health check endpoint
    if (url.pathname === '/health' && req.method === 'GET') {
      return new Response(JSON.stringify({ status: 'ok' }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Place a new order
    if (url.pathname === '/api/orders' && req.method === 'POST') {
      try {
        const body = await req.json();
        const order: Order = {
          type_op: body.type_op || 'limit',
          account_id: body.account_id,
          amount: body.amount,
          order_id: body.order_id,
          pair: body.pair,
          limit_price: body.limit_price,
          side: body.side
        };
        
        // Validate required fields
        if (!order.account_id || !order.amount || !order.pair || 
            !order.limit_price || !order.side) {
          return new Response(JSON.stringify({ 
            error: 'Missing required fields' 
          }), { 
            status: 400, 
            headers: { 'Content-Type': 'application/json' } 
          });
        }
        
        // Process the single order
        await controller.processOrders([order]);
        
        return new Response(JSON.stringify({ 
          success: true, 
          message: 'Order placed successfully',
          order_id: order.order_id
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (err) {
        return new Response(JSON.stringify({ 
          error: err instanceof Error ? err.message : String(err) 
        }), { 
          status: 500, 
          headers: { 'Content-Type': 'application/json' } 
        });
      }
    }
    
    // Get orderbook
    if (url.pathname === '/api/orderbook' && req.method === 'GET') {
      try {
        const orderBook = controller.getOrderBook();
        return new Response(JSON.stringify(orderBook), {
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (err) {
        return new Response(JSON.stringify({ 
          error: err instanceof Error ? err.message : String(err) 
        }), { 
          status: 500, 
          headers: { 'Content-Type': 'application/json' } 
        });
      }
    }
    
    // Get trades
    if (url.pathname === '/api/trades' && req.method === 'GET') {
      try {
        const trades = controller.getTrades();
        return new Response(JSON.stringify(trades), {
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (err) {
        return new Response(JSON.stringify({ 
          error: err instanceof Error ? err.message : String(err) 
        }), { 
          status: 500, 
          headers: { 'Content-Type': 'application/json' } 
        });
      }
    }
    
    // Not found
    return new Response(JSON.stringify({ error: 'Not found' }), { 
      status: 404, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
});

console.log(`Order engine API server running at http://localhost:${server.port}`);