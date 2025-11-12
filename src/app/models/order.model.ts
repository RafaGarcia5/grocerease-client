export interface OrderDetailPayload {
  product_id: number;
  pieces: number;
  unit_price: number;
}

export interface OrderPayload {
  user_id: number;
  order_date: string;
  status: string;
  total: number;
  details: OrderDetailPayload[];
}

export interface OrderResponse {
  id: number;
  user_id: number;
  order_date: string;
  status: string;
  total: number;
  details: {
    id: number;
    product_id: number;
    pieces: number;
    unit_price: number;
    product: {
      id: number;
      name: string;
      price: string;
      image_url: string | null;
    };
  }[];
}