interface Image {
  url: string | null;
  alt: string | null;
}
export interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  stock: number;
  image_url: string | null;
  category_id: number;
  status: string;
  category: { id: number; name: string };
  images: Image[];
}