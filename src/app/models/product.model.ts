export interface Product {
  id?: string;
  brand: string;
  name: string;
  packSize: string;
  caseSize: string;
  currentStock: number;
  orderQty: number;
}