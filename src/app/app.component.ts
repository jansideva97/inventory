import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from './services/product.service';
import { Product } from './models/product.model';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  private api = inject(ProductService);

  products = signal<Product[]>([]);
  brands = signal<string[]>([]);
  selectedBrand = signal<string>('');
  
  newProduct: Product = this.resetForm();
  newBrandName = '';

  filteredList = computed(() => 
    this.products().filter(p => p.brand === this.selectedBrand())
  );

  ngOnInit() {
    this.api.initData().subscribe(data => {
      if (data) {
        this.products.set(data.products || []);
        const brandNames = (data.brands || []).map((b: any) => b.name || b.id);
        this.brands.set(brandNames);
        if (brandNames.length > 0) {
          this.selectedBrand.set(brandNames[0]);
          this.onBrandChange();
        }
      }
    });
  }

  onBrandChange() {
    this.newProduct.brand = this.selectedBrand();
  }

  sync() {
    const data = {
      brands: this.brands().map(name => ({ id: name, name: name })),
      products: this.products()
    };
    this.api.saveToPhone(data);
  }

  addBrand() {
    const name = this.newBrandName.trim();
    if (!name || this.brands().includes(name)) return;
    this.brands.set([...this.brands(), name]);
    this.selectedBrand.set(name);
    this.sync();
    this.newBrandName = '';
  }

  deleteBrand() {
    const brandToDelete = this.selectedBrand();
    if (!brandToDelete) return;

    if (confirm(`Delete "${brandToDelete}" and all its products permanently?`)) {
      const updatedBrands = this.brands().filter(b => b !== brandToDelete);
      const updatedProducts = this.products().filter(p => p.brand !== brandToDelete);
      
      this.brands.set(updatedBrands);
      this.products.set(updatedProducts);
      
      this.selectedBrand.set(updatedBrands.length > 0 ? updatedBrands[0] : '');
      this.sync();
    }
  }

  add() {
    if (!this.newProduct.name) return;
    this.newProduct.brand = this.selectedBrand();
    this.newProduct.id = Date.now().toString();
    this.products.set([...this.products(), { ...this.newProduct }]);
    this.sync();
    this.newProduct = this.resetForm();
  }

  update(p: Product) {
    this.sync();
    alert('Stock Saved!');
  }

  remove(id: any) {
    if (confirm("Delete entry?")) {
      this.products.set(this.products().filter(p => p.id !== id));
      this.sync();
    }
  }

  resetForm(): Product {
    return { brand: this.selectedBrand(), name: '', packSize: '', caseSize: '', currentStock: 0, orderQty: 0 };
  }

  downloadPDF(type: 'filtered' | 'all') {
    const doc = new jsPDF();
    const data = type === 'filtered' ? this.filteredList() : this.products();
    autoTable(doc, {
      head: [['Brand', 'Product', 'Pack', 'Case', 'Stock', 'Order']],
      body: data.map(p => [p.brand, p.name, p.packSize, p.caseSize, p.currentStock, p.orderQty])
    });
    doc.save(`Stock_Report_${new Date().toLocaleDateString()}.pdf`);
  }
}