import { Component, OnInit, ViewChild } from '@angular/core';
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
  @ViewChild(MapComponent) mapComponent!: MapComponent;

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
  searchRadius: number = 0; // 0 = tutti, altrimenti km
  cities: City[] = [];

  // Posizione dell'utente (centro per il filtro spaziale)
  userLat = 41.9028; // default: Roma
  userLng = 12.4964;
  geolocated = false;
  userCityName: string | null = null;

  // Items mappati per la mappa
  mapItems: ItemDto[] = [];

  constructor(
    private lastItemsService: LastItemsService,
    private userService: UserService,
    private addItemService: AddItemService,
    private cityService: CityService,
  ) {}

  ngOnInit(): void {
    this.loadUserCity();
    this.detectUserPosition();
    this.loadItems();
    this.cityService.getCities().subscribe((c) => {
      this.cities = c;
      // Aggiorna il centro con la città del profilo se disponibile
      this.applyUserCityCenter();
      this.applyFilter();
    });
    this.addItemService.getCategories().subscribe((c) => (this.categories = c));
  }

  /** Carica la città dal profilo utente loggato */
  private loadUserCity(): void {
    this.userService.getUserDetails().subscribe({
      next: (user) => {
        if (user?.cityName) {
          this.userCityName = user.cityName;
          this.applyUserCityCenter();
        }
      },
      error: () => {
        console.warn('[UserService] Profilo non disponibile, uso default.');
      },
    });
  }

  /** Imposta il centro raggio sulle coordinate della città del profilo utente */
  private applyUserCityCenter(): void {
    if (this.userCityName && this.cities.length > 0 && !this.geolocated) {
      const city = this.cities.find((c) => c.name === this.userCityName);
      if (city) {
        this.userLat = city.latitude;
        this.userLng = city.longitude;
      }
    }
  }

  /** Rileva la posizione dell'utente tramite Geolocation API */
  private detectUserPosition(): void {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.userLat = pos.coords.latitude;
          this.userLng = pos.coords.longitude;
          this.geolocated = true;
          console.log(
            '[Geolocation] Posizione utente:',
            this.userLat,
            this.userLng,
          );
          this.applyFilter();
        },
        (err) => {
          console.warn(
            '[Geolocation] Non disponibile, uso default Roma:',
            err.message,
          );
        },
      );
    }
  }

  /**
   * Formula di Haversine: calcola la distanza in KM tra due coordinate.
   */
  private haversineKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // raggio terrestre in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
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
      const city = this.cities.find((c) => c.name === this.searchCity);
      if (city) {
        this.mapComponent?.flyTo(city.latitude, city.longitude);
      }
    } else {
      this.mapComponent?.resetView();
    }

    if (this.searchTrade === 'true') {
      result = result.filter((item) => item.activetrade === true);
    } else if (this.searchTrade === 'false') {
      result = result.filter((item) => item.activetrade === false);
    }

    // Filtro spaziale: attivo SOLO se è selezionata una città nel filtro.
    // Il centro è sempre la città filtrata; senza città il raggio non si applica.
    const selectedCity = this.searchCity
      ? this.cities.find((c) => c.name === this.searchCity)
      : null;

    if (this.searchRadius > 0 && selectedCity) {
      result = result.filter((item) => {
        const dto = this.toItemDto(item);
        if (dto.latitude == null || dto.longitude == null) return false;
        return (
          this.haversineKm(
            selectedCity.latitude,
            selectedCity.longitude,
            dto.latitude,
            dto.longitude,
          ) <= this.searchRadius
        );
      });
    }

    this.filteredItems = result;

    // Aggiorna gli items per la mappa in base ai filtri attivi
    this.mapItems = this.filteredItems.map((item) => this.toItemDto(item));

    // Cerchio sulla mappa: visibile solo se c'è sia una città che un raggio
    this.mapComponent?.setRadiusCircle(
      this.searchRadius > 0 && selectedCity ? selectedCity.latitude : null,
      this.searchRadius > 0 && selectedCity ? selectedCity.longitude : null,
      this.searchRadius,
    );
  }

  /** Converte un Item nel formato richiesto dal MapComponent */
  private toItemDto(item: Item): ItemDto {
    // Cerca le coordinate dalla lista delle città caricate
    const city = this.cities.find((c) => c.name === item.ownerCityName);
    return {
      id: item.id,
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
