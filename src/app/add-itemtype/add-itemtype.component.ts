import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, NgForm, Validators } from '@angular/forms';
import { ItemType } from '../model/itemtype.model';
import { WishlistService } from '../services/wishlist.service';
import { CommonModule, NgFor } from '@angular/common';
import { Router } from '@angular/router';
import { AddItemService } from '../services/add-item.service';

@Component({
  selector: 'app-add-itemtype',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './add-itemtype.component.html',
  styleUrl: './add-itemtype.component.css'
})
export class AddItemtypeComponent implements OnInit {
  typeForm!: FormGroup;
  categories: string[] = [];

  constructor(private router: Router, private wishlistService: WishlistService, private addItemService: AddItemService) { }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.addItemService.getCategories().subscribe({
      next: (data) => this.categories = data,
      error: (er) => {
        console.error('Errore nel caricamento delle categorie:', er);
      }
    });
  }

  onSubmit(ngForm : NgForm){
    const currentItemType : ItemType = {
      name: ngForm.value.name,
      description: ngForm.value.description,
      categoryName: ngForm.value.categoryName,
      dateAdded: new Date().toISOString().split('T')[0]
    }

    this.wishlistService.addItemTypeForLoggedUser(currentItemType).subscribe({
      next: (resp) => this.router.navigate(['wishlist']),
      error: (er) => {
        alert('Errore durenta il salvataggio del tipo');
      }
    })
  }
  

}
