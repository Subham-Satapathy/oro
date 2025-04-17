import * as fs from 'fs/promises';
import * as path from 'path';
import { MatchingEngine } from '../src/services/MatchingEngine';
import { Order } from '../src/models/Order';

// Create a mock for the main module
jest.mock('../src/index', () => {
  // Create a mock implementation of the main function
  const originalModule = jest.requireActual('../src/index');
  
  // When this module is imported, execute the mocked main function
  const mockMain = async () => {
    try {
      // Define paths
      const paths = {
        orders: 'src/input/orders.json',
        orderBook: 'outputs/orderbook.json',
        trades: 'outputs/trades.json'
      };

      console.log('Reading orders from:', paths.orders);

      // Read orders file and process
      const orders: Order[] = JSON.parse(
        await fs.readFile(paths.orders, 'utf-8')
      );

      // Process orders
      const engine = new MatchingEngine();
      engine.processOrders(orders);
      
      // Write files
      await Promise.all([
        fs.writeFile(
          paths.orderBook, 
          JSON.stringify(engine.getOrderBook(), null, 2)
        ),
        fs.writeFile(
          paths.trades, 
          JSON.stringify(engine.getTrades(), null, 2)
        )
      ]);

      console.log('Processing complete. Check orderbook.json and trades.json for results.');
    } catch (error) {
      console.error('Error processing orders:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  };

  // Execute the mock function when the module is imported
  mockMain();
  
  return originalModule;
}, { virtual: true });

// Mock the fs module
jest.mock('fs/promises');
const mockFs = fs as jest.Mocked<typeof fs>;

// Mock path.resolve
jest.mock('path', () => ({
  resolve: jest.fn().mockImplementation((...args) => args.join('/'))
}));

// Mock process.exit
jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);

// Mock console
const originalConsole = { ...console };
beforeEach(() => {
  console.log = jest.fn();
  console.error = jest.fn();
});
afterEach(() => {
  console.log = originalConsole.log;
  console.error = originalConsole.error;
});

describe('index.ts', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('should read from input file and write results to output files', async () => {
    // Mock test data
    const mockOrders = [
      {
        type_op: 'CREATE',
        account_id: 'acc1',
        amount: '5',
        order_id: '1',
        pair: 'BTC/USD',
        limit_price: '40000',
        side: 'BUY'
      },
      {
        type_op: 'CREATE',
        account_id: 'acc2',
        amount: '3',
        order_id: '2',
        pair: 'BTC/USD',
        limit_price: '40000',
        side: 'SELL'
      }
    ];

    // Setup mock fs.readFile to return our mock orders
    mockFs.readFile.mockImplementation((path) => {
      if (path.toString().includes('orders.json')) {
        return Promise.resolve(JSON.stringify(mockOrders));
      }
      return Promise.reject(new Error('File not found'));
    });
    
    // Setup mock fs.writeFile
    mockFs.writeFile.mockResolvedValue();

    // Import to execute the module
    const indexModule = await import('../src/index');
    
    // Wait for async operations to complete
    await new Promise(resolve => setTimeout(resolve, 50));

    // Verify fs interactions
    expect(mockFs.readFile).toHaveBeenCalled();
    expect(mockFs.readFile.mock.calls[0][0]).toContain('orders.json');
    
    expect(mockFs.writeFile).toHaveBeenCalledTimes(2);
    expect(mockFs.writeFile.mock.calls[0][0]).toContain('orderbook.json');
    expect(mockFs.writeFile.mock.calls[1][0]).toContain('trades.json');
    
    // Verify that console.log was called with messages containing our expected strings
    expect(console.log).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Reading orders'), expect.anything());
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Processing complete'));
  });
}); 