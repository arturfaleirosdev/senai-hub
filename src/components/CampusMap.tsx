import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Crosshair, LocateFixed, MapPin, Navigation, Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { CampusEvent } from '../data/sample';
import { CAMPUS_CENTER, CAMPUS_OUTLINE, PLACES, type CampusPlace } from '../data/places';
import { PLACE_CATEGORIES } from '../lib/categories';
import { formatTimeRange, relativeDayLabel } from '../lib/datetime';
import { SectionHeader } from './SectionHeader';

export interface MapFocus {
  placeId: string;
  /** Muda a cada pedido, para reabrir o mesmo local. */
  nonce: number;
}

interface CampusMapProps {
  events: CampusEvent[];
  focus: MapFocus | null;
}

type Filter = 'todos' | CampusPlace['categoria'];

const isIOS = () => typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);

/** Rota a pé no site do OpenStreetMap (OSRM), do ponto atual até o local. */
export const osmDirectionsUrl = (p: Pick<CampusPlace, 'lat' | 'lng'>) =>
  `https://www.openstreetmap.org/directions?engine=fossgis_osrm_foot&route=%3B${p.lat}%2C${p.lng}#map=19/${p.lat}/${p.lng}`;

/** Abre o app de mapas do celular (Apple Mapas no iPhone, app padrão no Android). */
export const nativeMapsUrl = (p: Pick<CampusPlace, 'lat' | 'lng' | 'nome'>) =>
  isIOS()
    ? `https://maps.apple.com/?daddr=${p.lat},${p.lng}&q=${encodeURIComponent(p.nome)}`
    : `geo:${p.lat},${p.lng}?q=${p.lat},${p.lng}(${encodeURIComponent(p.nome)})`;

function normalize(text: string) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

function pinIcon(place: CampusPlace, selected: boolean) {
  const color = PLACE_CATEGORIES[place.categoria].color;
  return L.divIcon({
    className: '',
    html: `<span class="sc-pin${selected ? ' sc-pin-selected' : ''}" style="--pin:${color};position:relative"></span>`,
    iconSize: [26, 26],
    iconAnchor: [13, 30],
    popupAnchor: [0, -30],
  });
}

/** Distância em metros entre dois pontos (fórmula de haversine). */
export function distanceMeters(a: [number, number], b: [number, number]) {
  const R = 6_371_000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Monta o conteúdo do popup com DOM (sem HTML em texto, nada a escapar). */
function buildPopup(place: CampusPlace, events: CampusEvent[], now: Date): HTMLElement {
  const el = (tag: string, className = '', text = '') => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  };
  const root = el('div', 'min-w-[200px] max-w-[260px]');
  root.append(el('p', 'text-[11px] font-bold uppercase tracking-wide text-slate-500', PLACE_CATEGORIES[place.categoria].label));
  root.append(el('p', 'mt-0.5 font-display text-[15px] font-bold text-brand-950', place.nome));
  root.append(el('p', 'mt-1 text-slate-600', place.descricao));
  if (place.fonte === 'aproximado') {
    root.append(el('p', 'mt-1 text-[11px] italic text-slate-400', 'Posição aproximada dentro do campus.'));
  }

  const upcoming = events.filter((e) => e.placeId === place.id && e.end.getTime() > now.getTime());
  if (upcoming.length) {
    const box = el('div', 'mt-2 rounded-lg bg-brand-50 p-2');
    box.append(el('p', 'text-[11px] font-bold uppercase tracking-wide text-brand-700', 'Eventos aqui'));
    for (const e of upcoming.slice(0, 3)) {
      const item = el('p', 'mt-1 text-[12px] text-brand-950');
      item.append(el('strong', '', `${relativeDayLabel(e.start, now)} · ${formatTimeRange(e.start, e.end)}`));
      item.append(document.createTextNode(` · ${e.title}`));
      box.append(item);
    }
    root.append(box);
  }

  const links = el('div', 'mt-2.5 flex flex-wrap gap-2');
  const route = el('a', 'rounded-md bg-brand-700 px-2.5 py-1.5 text-[12px] font-semibold !text-white no-underline', 'Como chegar') as HTMLAnchorElement;
  route.href = osmDirectionsUrl(place);
  route.target = '_blank';
  route.rel = 'noopener noreferrer';
  const app = el('a', 'rounded-md px-2.5 py-1.5 text-[12px] font-semibold !text-brand-700 ring-1 ring-brand-200 no-underline', 'App de mapas') as HTMLAnchorElement;
  app.href = nativeMapsUrl(place);
  links.append(route, app);
  root.append(links);
  return root;
}

export function CampusMap({ events, focus }: CampusMapProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef(new Map<string, L.Marker>());
  const meRef = useRef<L.LayerGroup | null>(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('todos');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [geoStatus, setGeoStatus] = useState<string | null>(null);

  const eventCount = useMemo(() => {
    const now = Date.now();
    const counts = new Map<string, number>();
    for (const e of events) {
      if (e.placeId && e.end.getTime() > now) counts.set(e.placeId, (counts.get(e.placeId) ?? 0) + 1);
    }
    return counts;
  }, [events]);

  const visible = useMemo(() => {
    const q = normalize(query.trim());
    return PLACES.filter(
      (p) =>
        (filter === 'todos' || p.categoria === filter) &&
        (!q || normalize(`${p.nome} ${p.descricao} ${PLACE_CATEGORIES[p.categoria].label}`).includes(q)),
    );
  }, [query, filter]);

  // Os popups leem a lista de eventos mais recente.
  const eventsRef = useRef(events);
  eventsRef.current = events;

  // Cria o mapa uma única vez.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      center: CAMPUS_CENTER,
      zoom: 18,
      maxZoom: 19,
      minZoom: 12,
      scrollWheelZoom: false, // não "prende" a rolagem da página; use os botões ou dois dedos
    });
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap contributors</a>',
    }).addTo(map);
    if (CAMPUS_OUTLINE.length) {
      L.polygon(CAMPUS_OUTLINE, { color: '#004a8d', weight: 2, fillColor: '#1f6fbf', fillOpacity: 0.08 }).addTo(map);
    }
    map.on('focus', () => map.scrollWheelZoom.enable());
    map.on('blur', () => map.scrollWheelZoom.disable());

    for (const place of PLACES) {
      const marker = L.marker([place.lat, place.lng], {
        icon: pinIcon(place, false),
        title: place.nome,
        alt: place.nome,
        riseOnHover: true,
      })
        .bindPopup(() => buildPopup(place, eventsRef.current, new Date()), { maxWidth: 280, autoPanPadding: [16, 16] })
        .on('popupopen', () => setSelectedId(place.id))
        .on('popupclose', () => setSelectedId((cur) => (cur === place.id ? null : cur)))
        .addTo(map);
      markersRef.current.set(place.id, marker);
    }
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current.clear();
      meRef.current = null;
    };
  }, []);

  // Mostra só os locais que passam no filtro/busca.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const ids = new Set(visible.map((p) => p.id));
    for (const [id, marker] of markersRef.current) {
      if (ids.has(id)) marker.addTo(map);
      else marker.remove();
    }
  }, [visible]);

  // Destaca o pino selecionado.
  useEffect(() => {
    for (const place of PLACES) {
      markersRef.current.get(place.id)?.setIcon(pinIcon(place, place.id === selectedId));
    }
  }, [selectedId]);

  const openPlace = (id: string) => {
    const map = mapRef.current;
    const marker = markersRef.current.get(id);
    const place = PLACES.find((p) => p.id === id);
    if (!map || !marker || !place) return;
    if (!map.hasLayer(marker)) {
      setFilter('todos');
      setQuery('');
      marker.addTo(map);
    }
    map.flyTo([place.lat, place.lng], 19, { duration: 0.6 });
    marker.openPopup();
  };

  // Pedido vindo de um evento ("Ver no mapa").
  useEffect(() => {
    if (!focus) return;
    sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const t = window.setTimeout(() => openPlace(focus.placeId), 350);
    return () => window.clearTimeout(t);
  }, [focus]); // eslint-disable-line react-hooks/exhaustive-deps

  const recenter = () => {
    mapRef.current?.closePopup();
    if (CAMPUS_OUTLINE.length) mapRef.current?.fitBounds(L.latLngBounds(CAMPUS_OUTLINE), { padding: [24, 24] });
  };

  const locateMe = () => {
    if (!('geolocation' in navigator)) {
      setGeoStatus('Seu navegador não permite localização.');
      return;
    }
    setGeoStatus('Procurando sua localização…');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const map = mapRef.current;
        if (!map) return;
        const me: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        meRef.current?.remove();
        meRef.current = L.layerGroup([
          L.circle(me, { radius: pos.coords.accuracy, color: '#1f6fbf', weight: 1, fillOpacity: 0.1 }),
          L.marker(me, {
            icon: L.divIcon({ className: '', html: '<span class="sc-me"></span>', iconSize: [16, 16], iconAnchor: [8, 8] }),
            title: 'Você está aqui',
            alt: 'Você está aqui',
          }),
        ]).addTo(map);
        const meters = distanceMeters(me, CAMPUS_CENTER);
        if (meters < 1500) map.flyTo(me, 18, { duration: 0.6 });
        else map.fitBounds(L.latLngBounds([me, CAMPUS_CENTER]), { padding: [40, 40] });
        setGeoStatus(
          meters < 150
            ? 'Você está no campus.'
            : `Você está a ${meters < 1000 ? `${Math.round(meters)} m` : `${(meters / 1000).toFixed(1).replace('.', ',')} km`} do campus.`,
        );
      },
      (err) =>
        setGeoStatus(
          err.code === err.PERMISSION_DENIED
            ? 'Permissão de localização negada. Ative nas configurações do navegador.'
            : 'Não foi possível obter sua localização agora.',
        ),
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 },
    );
  };

  const categories = Object.entries(PLACE_CATEGORIES) as [CampusPlace['categoria'], { label: string; color: string }][];

  return (
    <section ref={sectionRef} aria-labelledby="mapa-title" id="mapa">
      <SectionHeader id="mapa-title" eyebrow="Mapa do campus" title="Onde fica cada lugar" />

      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <span className="sr-only">Buscar local no campus</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar: biblioteca, laboratório, cantina…"
            maxLength={60}
            className="w-full rounded-xl border-0 bg-white py-2.5 pl-9 pr-3 text-sm shadow-sm ring-1 ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-brand-500"
          />
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={locateMe}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand-700 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-800 sm:flex-none"
          >
            <LocateFixed className="h-4 w-4" aria-hidden="true" />
            Minha localização
          </button>
          <button
            type="button"
            onClick={recenter}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-white px-3.5 py-2.5 text-sm font-semibold text-brand-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-brand-50"
          >
            <Crosshair className="h-4 w-4" aria-hidden="true" />
            Campus
          </button>
        </div>
      </div>

      <div role="group" aria-label="Filtrar locais por categoria" className="-mx-4 mb-3 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        <button
          type="button"
          aria-pressed={filter === 'todos'}
          onClick={() => setFilter('todos')}
          className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold ring-1 transition ${
            filter === 'todos' ? 'bg-brand-800 text-white ring-brand-800' : 'bg-white text-slate-600 ring-slate-200 hover:ring-brand-300'
          }`}
        >
          Todos
        </button>
        {categories.map(([key, meta]) => (
          <button
            key={key}
            type="button"
            aria-pressed={filter === key}
            onClick={() => setFilter(key)}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold ring-1 transition ${
              filter === key ? 'bg-brand-800 text-white ring-brand-800' : 'bg-white text-slate-600 ring-slate-200 hover:ring-brand-300'
            }`}
          >
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: meta.color }} aria-hidden="true" />
            {meta.label}
          </button>
        ))}
      </div>

      {geoStatus && (
        <p role="status" className="mb-3 rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-800">
          {geoStatus}
        </p>
      )}

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <div className="relative isolate overflow-hidden rounded-2xl shadow-sm ring-1 ring-slate-200">
          <div
            ref={containerRef}
            className="h-[380px] w-full sm:h-[460px]"
            role="region"
            aria-label="Mapa interativo do campus SENAI Taguatinga"
          />
        </div>

        <ul aria-label="Locais do campus" className="max-h-[460px] space-y-2 overflow-y-auto pr-1">
          {visible.length === 0 && (
            <li className="rounded-2xl bg-white p-4 text-sm text-slate-500 ring-1 ring-slate-200">Nenhum local encontrado.</li>
          )}
          {visible.map((p) => {
            const meta = PLACE_CATEGORIES[p.categoria];
            const count = eventCount.get(p.id) ?? 0;
            return (
              <li key={p.id}>
                <div
                  className={`flex items-start gap-2 rounded-2xl bg-white p-1.5 shadow-sm ring-1 transition ${
                    selectedId === p.id ? 'ring-2 ring-brand-500' : 'ring-slate-200 hover:ring-brand-300'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => openPlace(p.id)}
                    aria-current={selectedId === p.id ? 'true' : undefined}
                    className="flex min-w-0 flex-1 items-start gap-3 rounded-xl p-1.5 text-left"
                  >
                    <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg text-white" style={{ background: meta.color }}>
                      <MapPin className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold leading-snug text-brand-950">
                        {p.nome}
                        {p.fonte === 'aproximado' && (
                          <span className="text-slate-400" title="Posição aproximada">
                            {' '}*
                          </span>
                        )}
                      </span>
                      <span className="block text-xs text-slate-500">{meta.label}</span>
                      {count > 0 && (
                        <span className="mt-1 inline-block rounded-full bg-accent-50 px-2 py-0.5 text-[11px] font-bold text-accent-700">
                          {count} {count === 1 ? 'evento' : 'eventos'} aqui
                        </span>
                      )}
                    </span>
                  </button>
                  <a
                    href={osmDirectionsUrl(p)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="m-1.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg text-brand-700 ring-1 ring-slate-200 hover:bg-brand-50"
                    aria-label={`Como chegar: ${p.nome}`}
                    title="Como chegar"
                  >
                    <Navigation className="h-4 w-4" aria-hidden="true" />
                  </a>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
      <p className="mt-2 text-xs text-slate-500">
        Blocos, auditório, biblioteca, cantina e estacionamento: posições do OpenStreetMap. * Posição aproximada (conferir no local).
      </p>
    </section>
  );
}
