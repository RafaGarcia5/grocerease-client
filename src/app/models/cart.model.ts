import { Product } from "./product.model";

export interface CartItem {
  id: number;
  cart_id: number;
  product_id: number;
  quantity: number;
  product: Product;
}

export interface CartItemPayload {
  product_id: number;
  quantity: number;
};