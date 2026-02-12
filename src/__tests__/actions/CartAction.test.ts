import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleCart } from '@/engine/actions/CartAction';
import type { ActionContext } from '@/schemas/actions';

describe('CartAction', () => {
  let mockContext: ActionContext;

  beforeEach(() => {
    mockContext = {
      navigate: vi.fn(),
      getState: vi.fn().mockReturnValue([]),
      setState: vi.fn(),
      formData: {},
    };
  });

  it('should add new item to empty cart', async () => {
    const item = {
      id: '123',
      name: 'Test Product',
      description: 'A test product',
      price: 99.99,
      image: 'https://example.com/image.jpg',
      quantity: 1,
    };
    const action = {
      type: 'cart' as const,
      operation: 'add' as const,
      item,
    };

    const result = await handleCart(action, mockContext);

    expect(mockContext.setState).toHaveBeenCalledWith('cart', [item], false);
    expect(result.success).toBe(true);
    expect(result.data).toEqual([item]);
  });

  it('should add item to existing cart', async () => {
    const existingItem = {
      id: '1',
      name: 'Product 1',
      description: 'First product',
      price: 50,
      image: 'https://example.com/1.jpg',
      quantity: 1,
    };
    mockContext.getState = vi.fn().mockReturnValue([existingItem]);

    const newItem = {
      id: '2',
      name: 'Product 2',
      description: 'Second product',
      price: 75,
      image: 'https://example.com/2.jpg',
      quantity: 1,
    };
    const action = {
      type: 'cart' as const,
      operation: 'add' as const,
      item: newItem,
    };

    const result = await handleCart(action, mockContext);

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(2);
    expect(result.data).toContainEqual(existingItem);
    expect(result.data).toContainEqual(newItem);
  });

  it('should increment quantity when adding existing item', async () => {
    const existingItem = {
      id: '123',
      name: 'Product',
      description: 'Test',
      price: 50,
      image: 'https://example.com/image.jpg',
      quantity: 2,
    };
    mockContext.getState = vi.fn().mockReturnValue([existingItem]);

    const sameItem = {
      id: '123',
      name: 'Product',
      description: 'Test',
      price: 50,
      image: 'https://example.com/image.jpg',
      quantity: 3,
    };
    const action = {
      type: 'cart' as const,
      operation: 'add' as const,
      item: sameItem,
    };

    const result = await handleCart(action, mockContext);

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(1);
    expect(result.data![0].quantity).toBe(5); // 2 + 3
  });

  it('should remove item from cart', async () => {
    const items = [
      {
        id: '1',
        name: 'Product 1',
        description: 'First',
        price: 50,
        image: 'https://example.com/1.jpg',
        quantity: 1,
      },
      {
        id: '2',
        name: 'Product 2',
        description: 'Second',
        price: 75,
        image: 'https://example.com/2.jpg',
        quantity: 1,
      },
    ];
    mockContext.getState = vi.fn().mockReturnValue(items);

    const action = {
      type: 'cart' as const,
      operation: 'remove' as const,
      itemId: '1',
    };

    const result = await handleCart(action, mockContext);

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(1);
    expect(result.data![0].id).toBe('2');
  });

  it('should update item quantity', async () => {
    const items = [
      {
        id: '123',
        name: 'Product',
        description: 'Test',
        price: 50,
        image: 'https://example.com/image.jpg',
        quantity: 2,
      },
    ];
    mockContext.getState = vi.fn().mockReturnValue(items);

    const action = {
      type: 'cart' as const,
      operation: 'updateQuantity' as const,
      itemId: '123',
      quantity: 5,
    };

    const result = await handleCart(action, mockContext);

    expect(result.success).toBe(true);
    expect(result.data![0].quantity).toBe(5);
  });

  it('should remove item when updating quantity to 0', async () => {
    const items = [
      {
        id: '123',
        name: 'Product',
        description: 'Test',
        price: 50,
        image: 'https://example.com/image.jpg',
        quantity: 2,
      },
    ];
    mockContext.getState = vi.fn().mockReturnValue(items);

    const action = {
      type: 'cart' as const,
      operation: 'updateQuantity' as const,
      itemId: '123',
      quantity: 0,
    };

    const result = await handleCart(action, mockContext);

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(0);
  });

  it('should remove item when updating quantity to negative', async () => {
    const items = [
      {
        id: '123',
        name: 'Product',
        description: 'Test',
        price: 50,
        image: 'https://example.com/image.jpg',
        quantity: 2,
      },
    ];
    mockContext.getState = vi.fn().mockReturnValue(items);

    const action = {
      type: 'cart' as const,
      operation: 'updateQuantity' as const,
      itemId: '123',
      quantity: -1,
    };

    const result = await handleCart(action, mockContext);

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(0);
  });

  it('should clear entire cart', async () => {
    const items = [
      {
        id: '1',
        name: 'Product 1',
        description: 'First',
        price: 50,
        image: 'https://example.com/1.jpg',
        quantity: 1,
      },
      {
        id: '2',
        name: 'Product 2',
        description: 'Second',
        price: 75,
        image: 'https://example.com/2.jpg',
        quantity: 1,
      },
    ];
    mockContext.getState = vi.fn().mockReturnValue(items);

    const action = {
      type: 'cart' as const,
      operation: 'clear' as const,
    };

    const result = await handleCart(action, mockContext);

    expect(mockContext.setState).toHaveBeenCalledWith('cart', [], false);
    expect(result.success).toBe(true);
    expect(result.data).toEqual([]);
  });

  it('should return error when item is missing for add operation', async () => {
    const action = {
      type: 'cart' as const,
      operation: 'add' as const,
    };

    const result = await handleCart(action, mockContext);

    expect(result.success).toBe(false);
    expect(result.error?.message).toBe('Item required for add operation');
  });

  it('should return error when itemId is missing for remove operation', async () => {
    const action = {
      type: 'cart' as const,
      operation: 'remove' as const,
    };

    const result = await handleCart(action, mockContext);

    expect(result.success).toBe(false);
    expect(result.error?.message).toBe('itemId required for remove operation');
  });

  it('should return error when itemId or quantity is missing for updateQuantity', async () => {
    const action = {
      type: 'cart' as const,
      operation: 'updateQuantity' as const,
      itemId: '123',
    };

    const result = await handleCart(action, mockContext);

    expect(result.success).toBe(false);
    expect(result.error?.message).toBe('itemId and quantity required for updateQuantity operation');
  });

  it('should handle errors during setState', async () => {
    const item = {
      id: '123',
      name: 'Product',
      description: 'Test',
      price: 50,
      image: 'https://example.com/image.jpg',
      quantity: 1,
    };
    mockContext.setState = vi.fn().mockImplementation(() => {
      throw new Error('setState failed');
    });

    const action = {
      type: 'cart' as const,
      operation: 'add' as const,
      item,
    };

    const result = await handleCart(action, mockContext);

    expect(result.success).toBe(false);
    expect(result.error?.message).toBe('setState failed');
  });

  it('should handle empty cart state correctly', async () => {
    mockContext.getState = vi.fn().mockReturnValue(null);

    const item = {
      id: '123',
      name: 'Product',
      description: 'Test',
      price: 50,
      image: 'https://example.com/image.jpg',
      quantity: 1,
    };
    const action = {
      type: 'cart' as const,
      operation: 'add' as const,
      item,
    };

    const result = await handleCart(action, mockContext);

    expect(result.success).toBe(true);
    expect(result.data).toEqual([item]);
  });
});
