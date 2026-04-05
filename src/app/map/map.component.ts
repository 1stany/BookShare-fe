import {
  Component,
  AfterViewInit,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import * as L from 'leaflet';
import 'leaflet.markercluster';
import { ItemDto } from '../model/item-dto.model';

// Fix per le icone di Leaflet che non vengono trovate in Angular
// (Webpack riscrive i path delle immagini, questo li ripristina)
const iconDefault = L.icon({
  iconRetinaUrl: 'assets/marker-icon-2x.png',
  iconUrl: 'assets/marker-icon.png',
  shadowUrl: 'assets/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = iconDefault;

@Component({
  selector: 'app-map',
  standalone: true,
  templateUrl: './map.component.html',
  styleUrl: './map.component.css',
})
export class MapComponent implements AfterViewInit, OnChanges {
  // Array di libri da visualizzare sulla mappa
  @Input() items: ItemDto[] = [];

  private map!: L.Map;
  // MarkerClusterGroup per raggruppare i marker vicini
  private markersLayer!: L.MarkerClusterGroup;

  ngAfterViewInit(): void {
    this.initMap();
    this.updateMarkers();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Aggiorna i marker ogni volta che l'input items cambia (es. dopo un filtro)
    if (changes['items'] && this.map) {
      this.updateMarkers();
    }
  }

  /** Inizializza la mappa Leaflet centrata sull'Italia */
  private initMap(): void {
    this.map = L.map('map').setView([41.9028, 12.4964], 6);

    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20,
      },
    ).addTo(this.map);

    // Inizializza il cluster *dopo* che il side-effect import ha esteso L
    this.markersLayer = L.markerClusterGroup();
    // Aggiunge il layer dei marker alla mappa
    this.markersLayer.addTo(this.map);
  }

  /**
   * Pulisce i marker esistenti e li ricrea in base agli items correnti.
   * Raggruppa i libri con le stesse coordinate (stessa città)
   * mostrando tutti i titoli nello stesso popup.
   */
  updateMarkers(): void {
    // Pulisci tutti i marker precedenti
    this.markersLayer.clearLayers();

    if (!this.items || this.items.length === 0) {
      return;
    }

    // Raggruppa gli items per coordinate (stessa città = stesso marker)
    const grouped = new Map<string, ItemDto[]>();

    for (const item of this.items) {
      // Controllo: salta items con coordinate nulle per evitare errori
      if (item.latitude == null || item.longitude == null) {
        continue;
      }

      const key = `${item.latitude},${item.longitude}`;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(item);
    }

    // Crea un marker per ogni gruppo di coordinate
    grouped.forEach((groupedItems, key) => {
      const [lat, lng] = key.split(',').map(Number);

      // Popup: lockerpoint in grassetto + titolo del libro per ogni item
      const popupContent = groupedItems
        .map(
          (item) =>
            `<strong>${this.escapeHtml(item.lockerpoint)}</strong><br>${this.escapeHtml(item.title)}`,
        )
        .join('<hr>');

      const marker = L.marker([lat, lng]).bindPopup(popupContent);
      this.markersLayer.addLayer(marker);
    });
  }

  /** Fa "volare" la mappa verso le coordinate indicate */
  flyTo(lat: number, lng: number, zoom = 13): void {
    if (this.map) {
      this.map.flyTo([lat, lng], zoom);
    }
  }

  /** Resetta la vista iniziale centrata sull'Italia */
  resetView(): void {
    if (this.map) {
      this.map.flyTo([41.9028, 12.4964], 6);
    }
  }

  /** Sanitizza il testo per evitare XSS injection nel popup HTML */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
  }
}
