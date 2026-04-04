import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { User } from '../model/user.model';
import { City } from '../model/city.model';
import { Item } from '../model/item.model';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { ItemType } from '../model/itemtype.model';
import { WishlistService } from '../services/wishlist.service';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { CityService } from '../services/city.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    MatTabsModule,
    MatIconModule,
    MatGridListModule,
    MatSelectModule,
    MatFormFieldModule,
    FormsModule,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  flipped = false;
  isAuthenticated = true;
  user: User | undefined;
  items: Item[] = [];
  myWishlist: ItemType[] = [];
  cities: City[] = [];
  editingCity = false;
  selectedCityId: number | null = null;

  constructor(
    private userService: UserService,
    private wishlistService: WishlistService,
    private cityService: CityService,
  ) {}

  ngOnInit(): void {
    // Controlla se l'utente è autenticato
    const token = localStorage.getItem('token');
    if (!token) {
      this.isAuthenticated = false;
      console.warn('Utente non autenticato');
      return;
    }

    this.userService.getUserDetails().subscribe((u) => (this.user = u));
    this.userService.getItems().subscribe((i: Item[]) => (this.items = i));
    this.wishlistService.getMyWishlist().subscribe((it: ItemType[]) => {
      this.myWishlist = it;
    });
    this.cityService.getCities().subscribe((c) => (this.cities = c));
  }

  toggleFlip() {
    this.flipped = !this.flipped;
  }

  startEditCity() {
    const current = this.cities.find((c) => c.name === this.user?.cityName);
    this.selectedCityId = current ? current.id : null;
    this.editingCity = true;
  }

  cancelEditCity() {
    this.editingCity = false;
  }

  saveCity() {
    if (this.selectedCityId == null) return;
    this.userService.updateCity(this.selectedCityId).subscribe({
      next: (u) => {
        this.user = u;
        this.editingCity = false;
      },
      error: (err) => console.error('Errore aggiornamento città:', err),
    });
  }
}
