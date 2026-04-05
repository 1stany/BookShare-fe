import { Component, OnInit } from '@angular/core';
import { LastItemsService } from '../services/last-items.service';
import { RouterModule } from '@angular/router';
import { Item } from '../model/item.model';
import { ItemDto } from '../model/item-dto.model';
import { City } from '../model/city.model';
import { UserService } from '../services/user.service';
import { CommonModule } from '@angular/common';
import { AddItemService } from '../services/add-item.service';
import { FormsModule } from '@angular/forms';
import { CityService } from '../services/city.service';
import { MapComponent } from '../map/map.component';

@Component({
  selector: 'app-last-items',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule, MapComponent],
  templateUrl: './last-items.component.html',
  styleUrl: './last-items.component.css',
})
export class LastItemsComponent implements OnInit {
  items: Item[] = [];
  filteredItems: Item[] = [];
  pars: [boolean, number] = [true, 10];
  categories: string[] = [];
  categoryDescriptions: Map<string, string> = new Map();
  selectedCategory: string | null = null;
  categoryCounts: Map<string, number> = new Map();

  // Search filters
  searchName = '';
  searchCity: string | null = null;
  searchTrade: string = 'all'; // 'all' | 'true' | 'false'
  cities: City[] = [];

  // Items mappati per la mappa
  mapItems: ItemDto[] = [];

  constructor(
    private lastItemsService: LastItemsService,
    private userService: UserService,
    private addItemService: AddItemService,
    private cityService: CityService,
  ) {}

  ngOnInit(): void {
    this.loadItems();
    this.cityService.getCities().subscribe((c) => (this.cities = c));
    this.addItemService.getCategories().subscribe((c) => (this.categories = c));
  }

  loadItems(): void {
    this.lastItemsService.getLastItems(this.pars).subscribe((is: Item[]) => {
      this.items = is
        .filter((i) => i.ownerEmail !== localStorage.getItem('userEmail'))
        .map((i) => {
          if (i.cover) {
            i.cover = 'http://localhost:8080/' + i.cover;
          }
          return i;
        });

      this.calculateCategoryCounts();
      this.applyFilter();
    });
  }

  updateCategoriesFromItems(): void {
    const allCategories = new Set<string>();
    this.items.forEach((item) => {
      if (item.categoryName) {
        allCategories.add(item.categoryName);
      }
    });
    this.categories = Array.from(allCategories).sort((a, b) =>
      a.localeCompare(b, 'it'),
    );
    this.loadCategoryDescriptions();
  }

  loadCategoryDescriptions(): void {
    // Map category names to descriptions
    // In a real scenario, this could come from the backend
    const descriptions: { [key: string]: string } = {
      Elettronica: 'Articoli elettronici vari',
      Giardinaggio: 'Strumenti e articoli per il giardinaggio',
      Casa: 'Articoli per la casa',
      Libri: 'Libri di vario genere',
      Abbigliamento: 'Vestiti e accessori',
      Sport: 'Articoli sportivi',
    };

    this.categories.forEach((cat) => {
      this.categoryDescriptions.set(
        cat,
        descriptions[cat] || 'Categoria varia',
      );
    });
  }

  calculateCategoryCounts(): void {
    this.categoryCounts.clear();
    this.items.forEach((item) => {
      const count = this.categoryCounts.get(item.categoryName) || 0;
      this.categoryCounts.set(item.categoryName, count + 1);
    });
  }

  filterByCategory(category: string): void {
    this.selectedCategory =
      this.selectedCategory === category ? null : category;
    this.applyFilter();
  }

  applyFilter(): void {
    let result = this.items;

    if (this.selectedCategory) {
      result = result.filter(
        (item) => item.categoryName === this.selectedCategory,
      );
    }

    if (this.searchName.trim()) {
      const term = this.searchName.trim().toLowerCase();
      result = result.filter((item) => item.name.toLowerCase().includes(term));
    }

    if (this.searchCity) {
      result = result.filter((item) => item.ownerCityName === this.searchCity);
    }

    if (this.searchTrade === 'true') {
      result = result.filter((item) => item.activetrade === true);
    } else if (this.searchTrade === 'false') {
      result = result.filter((item) => item.activetrade === false);
    }

    this.filteredItems = result;

    // Aggiorna gli items per la mappa in base ai filtri attivi
    this.mapItems = this.filteredItems.map((item) => this.toItemDto(item));
  }

  /** Converte un Item nel formato richiesto dal MapComponent */
  private toItemDto(item: Item): ItemDto {
    // Cerca le coordinate dalla lista delle città caricate
    const city = this.cities.find((c) => c.name === item.ownerCityName);
    return {
      title: item.name,
      latitude: item.latitude ?? city?.latitude ?? null,
      longitude: item.longitude ?? city?.longitude ?? null,
      lockerpoint: item.lockerpoint ?? city?.lockerpoint ?? '',
    };
  }

  isSelected(category: string): boolean {
    return this.selectedCategory === category;
  }

  getCategoryCount(category: string): number {
    return this.categoryCounts.get(category) || 0;
  }

  getDescription(category: string): string {
    return this.categoryDescriptions.get(category) || '';
  }
}
