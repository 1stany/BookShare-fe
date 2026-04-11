import {
  Component,
  AfterViewInit,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import * as Leaflet from 'leaflet';
import 'leaflet.markercluster';
import { ItemDto } from '../model/item-dto.model';
import { Router } from '@angular/router';

// Forza TypeScript a trattare L come any, evitando errori su markerClusterGroup
declare var L: any;

// Fix per le icone di Leaflet che non vengono trovate in Angular
const iconDefault = Leaflet.icon({
  iconRetinaUrl: 'assets/marker-icon-2x.png',
  iconUrl: 'assets/marker-icon.png',
  shadowUrl: 'assets/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});
Leaflet.Marker.prototype.options.icon = iconDefault;

@Component({
  selector: 'app-map',
  standalone: true,
  templateUrl: './map.component.html',
  styleUrl: './map.component.css',
})
export class MapComponent implements AfterViewInit, OnChanges {
  @Input() items: ItemDto[] = [];

  constructor(private router: Router) {}

  private map: any;
  private markersLayer: any;
  private radiusCircle: any = null;

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnChanges(changes: SimpleChanges): void {
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

    // Piano A: MarkerClusterGroup — Piano B: LayerGroup semplice
    if (typeof L.markerClusterGroup === 'function') {
      this.markersLayer = L.markerClusterGroup();
      console.log(
        '[MapComponent] MarkerClusterGroup inizializzato correttamente.',
      );
    } else {
      this.markersLayer = L.layerGroup();
      console.warn(
        '[MapComponent] markerClusterGroup non disponibile — fallback a LayerGroup.',
      );
    }

    this.markersLayer.addTo(this.map);
  }

  /** Pulisce e ricrea i marker in base agli items correnti */
  updateMarkers(): void {
    this.markersLayer.clearLayers();

    if (!this.items || this.items.length === 0) {
      return;
    }

    const withCoords = this.items.filter(
      (i) => i.latitude != null && i.longitude != null,
    );
    console.log(
      '[MapComponent] Items con coordinate valide:',
      withCoords.length,
      '/',
      this.items.length,
    );

    if (withCoords.length === 0) {
      console.warn('[MapComponent] Nessun item ha coordinate valide.');
      return;
    }

    // Raggruppa gli items per coordinate (stessa città = stesso marker)
    const grouped = new Map<string, ItemDto[]>();

    for (const item of withCoords) {
      const key = `${item.latitude},${item.longitude}`;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(item);
    }

    // Crea un marker per ogni gruppo di coordinate
    grouped.forEach((groupedItems, key) => {
      const [lat, lng] = key.split(',').map(Number);

      // Popup con lockerpoint, titolo e pulsante "Prenota"
      const popupContent = groupedItems
        .map(
          (item) =>
            `<div style="margin-bottom:6px;">` +
            `<strong>${this.escapeHtml(item.lockerpoint)}</strong><br>` +
            `${this.escapeHtml(item.title)}<br>` +
            `<button id="popup-book-${item.id}"
          style="display:inline-block;margin-top:4px;padding:4px 12px;background:#43b600;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:14px;">
        Prenota
      </button>` +
            `</div>`,
        )
        .join('<hr>');

      const marker = L.marker([lat, lng]).bindPopup(popupContent);
      this.markersLayer.addLayer(marker);

      marker.on('popupopen', () => {
        groupedItems.forEach((item) => {
          const btn = document.getElementById(`popup-book-${item.id}`);
          if (btn) {
            btn.addEventListener('click', () => {
              this.router.navigate(['/item', item.id]);
            });
          }
        });
      });
    });

    // Fix visibilità: forza il ricalcolo delle dimensioni della mappa
    setTimeout(() => {
      this.map.invalidateSize();
    }, 200);
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

  /** Mostra/nasconde il cerchio del raggio di ricerca sulla mappa */
  setRadiusCircle(
    lat: number | null,
    lng: number | null,
    radiusKm: number,
  ): void {
    // Rimuove il cerchio precedente
    if (this.radiusCircle) {
      this.map.removeLayer(this.radiusCircle);
      this.radiusCircle = null;
    }

    if (lat == null || lng == null || radiusKm <= 0) {
      return;
    }

    this.radiusCircle = L.circle([lat, lng], {
      radius: radiusKm * 1000, // Leaflet usa metri
      color: '#2d8300',
      fillColor: '#43b600',
      fillOpacity: 0.1,
      weight: 2,
      dashArray: '6 4',
    }).addTo(this.map);

    // Adatta la vista al cerchio
    this.map.fitBounds(this.radiusCircle.getBounds(), { padding: [20, 20] });
  }

  /** Sanitizza il testo per evitare XSS injection nel popup HTML */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
  }
}
