import { z } from 'zod';
import { CartActionSchema } from '../../schemas/actions';
import type { DispatchResult, ActionContext } from '../../schemas/actions';

interface CartItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  quantity: number;
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
          return { success: false, error: new Error('Item required for add operation') };
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
        if (action.item) {
          // Remove by full item match (id + color)
          newItems = currentCart.items.filter(item =>
            !(item.id === action.item!.id && item.color === action.item!.color)
          );
        } else if (action.itemId) {
          // Legacy: remove by id only
          newItems = currentCart.items.filter(item => item.id !== action.itemId);
        } else {
          return { success: false, error: new Error('item or itemId required for remove operation') };
        }
        break;
      }

      case 'updateQuantity':
      case 'update': {
        if (action.item) {
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
        } else if (action.itemId && action.quantity !== undefined) {
          // Legacy: update by id only
          if (action.quantity <= 0) {
            newItems = currentCart.items.filter(item => item.id !== action.itemId);
          } else {
            newItems = currentCart.items.map(item =>
              item.id === action.itemId ? { ...item, quantity: action.quantity! } : item
            );
          }
        } else {
          return { success: false, error: new Error('item or (itemId and quantity) required for update operation') };
        }
        break;
      }

      case 'clear': {
        newItems = [];
        break;
      }

      default:
        return { success: false, error: new Error('Invalid cart operation') };
    }

    const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const newCart: CartState = {
      items: newItems,
      itemCount,
      totalPrice,
    };

    context.setState('cart', newCart, false);
    return { success: true, data: newCart };
  } catch (error) {
    return { success: false, error: error as Error };
  }
}