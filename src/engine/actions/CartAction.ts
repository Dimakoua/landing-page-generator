import { z } from 'zod';
import { CartActionSchema } from '../../schemas/actions';
import type { DispatchResult, ActionContext } from '../../schemas/actions';
import { EventFactory } from '../events/EventFactory';

interface CartItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  quantity: number;
  color?: string;
}

interface CartState {
  items: CartItem[];
  itemCount: number;
  totalPrice: number;
}

export async function handleCart(
  action: z.infer<typeof CartActionSchema>,
  context: ActionContext
): Promise<DispatchResult> {
  try {
    const currentCart = (context.getState('cart') as CartState) || { items: [], itemCount: 0, totalPrice: 0 };

    let newItems: CartItem[];

    switch (action.operation) {
      case 'add': {
        if (!action.item) {
          throw new Error('Item required for add operation');
        }
        // Check if item already exists (same id and color)
        const existingIndex = currentCart.items.findIndex(item =>
          item.id === action.item!.id && item.color === action.item!.color
        );
        if (existingIndex >= 0) {
          // Update quantity
          newItems = [...currentCart.items];
          newItems[existingIndex].quantity += action.item.quantity || 1;
        } else {
          // Add new item
          newItems = [...currentCart.items, action.item];
        }
        break;
      }

      case 'remove': {
        if (!action.item) {
          throw new Error('item required for remove operation');
        }
        // Remove by full item match (id + color)
        newItems = currentCart.items.filter(item =>
          !(item.id === action.item!.id && item.color === action.item!.color)
        );
        break;
      }

      case 'updateQuantity':
      case 'update': {
        if (!action.item) {
          throw new Error('item required for update operation');
        }
        // Update by full item match
        const { id, color, quantity } = action.item;
        if (quantity <= 0) {
          newItems = currentCart.items.filter(item =>
            !(item.id === id && item.color === color)
          );
        } else {
          newItems = currentCart.items.map(item =>
            (item.id === id && item.color === color) ? { ...item, quantity } : item
          );
        }
        break;
      }

      case 'clear': {
        newItems = [];
        break;
      }

      default:
        throw new Error('Invalid cart operation');
    }

    const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const newCart: CartState = {
      items: newItems,
      itemCount,
      totalPrice,
    };

    context.setState('cart', newCart, false);

    // Emit cart updated event
    await EventFactory.cartUpdated(newCart.items, newCart.totalPrice, 'CartAction');

    return { success: true, data: newCart };
  } catch (error) {
    // Emit action error event
    await EventFactory.actionError('cart', (error as Error).message, 'CartAction');

    return { success: false, error: error as Error };
  }
}