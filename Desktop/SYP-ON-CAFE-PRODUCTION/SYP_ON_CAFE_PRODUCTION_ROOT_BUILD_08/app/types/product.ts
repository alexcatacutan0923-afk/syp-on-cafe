export type Product = {
  id: number;
  name: string;
  category: string;
  description: string | null;
  image: string | null;
  price16: number;
  price22: number | null;
  available: boolean;
  created_at: string;
};