import { Injectable } from '@angular/core';
import Dexie, { Table } from 'dexie';
import { Product } from '../models/product.model';

export interface Brand {
  id?: number;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class LocalDbService extends Dexie {
  products!: Table<Product, number>;
  brands!: Table<Brand, number>;

  constructor() {
    super('InventoryDB');
    this.version(1).stores({
      products: '++id, brand, name',
      brands: '++id, name'
    });
  }
}