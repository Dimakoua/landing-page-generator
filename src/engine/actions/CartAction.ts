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

export async function handleCart(
  action: z.infer<typeof CartActionSchema>,
  context: ActionContext
): Promise<DispatchResult> {
  try {
    const currentCart = (context.getState('cart') as CartItem[]) || [];

    let newCart: CartItem[];

    switch (action.operation) {
      case 'add': {
        if (!action.item) {
          return { success: false, error: new Error('Item required for add operation') };
        }
        // Check if item already exists
        const existingIndex = currentCart.findIndex(item => item.id === action.item!.id);
        if (existingIndex >= 0) {
          // Update quantity
          newCart = [...currentCart];
          newCart[existingIndex].quantity += action.item.quantity || 1;
        } else {
          // Add new item
          newCart = [...currentCart, action.item];
        }
        break;
      }

      case 'remove': {
        if (!action.itemId) {
          return { success: false, error: new Error('itemId required for remove operation') };
        }
        newCart = currentCart.filter(item => item.id !== action.itemId);
        break;
      }

      case 'updateQuantity': {
        if (!action.itemId || action.quantity === undefined) {
          return { success: false, error: new Error('itemId and quantity required for updateQuantity operation') };
        }
        if (action.quantity <= 0) {
          // Remove item if quantity is 0 or negative
          newCart = currentCart.filter(item => item.id !== action.itemId);
        } else {
          newCart = currentCart.map(item =>
            item.id === action.itemId ? { ...item, quantity: action.quantity! } : item
          );
        }
        break;
      }

      case 'clear': {
        newCart = [];
        break;
      }

      default:
        return { success: false, error: new Error('Invalid cart operation') };
    }

    context.setState('cart', newCart, false);
    return { success: true, data: newCart };
  } catch (error) {
    return { success: false, error: error as Error };
  }
}