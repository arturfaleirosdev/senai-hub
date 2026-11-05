/**
 * Locais do campus, lidos do arquivo editável `campus-locais.geojson`.
 * Para mudar a posição de um local, edite as coordenadas lá
 * ([longitude, latitude]); não é preciso mexer neste arquivo.
 */
import raw from './campus-locais.geojson?raw';

export type PlaceCategory =
  | 'campus'
  | 'entrada'
  | 'estacionamento'
  | 'servicos'
  | 'convivencia'
  | 'alimentacao'
  | 'academico'
  | 'laboratorio'
  | 'oficina'
  | 'banheiro'
  | 'acessibilidade';

export interface CampusPlace {
  id: string;
  nome: string;
  categoria: Exclude<PlaceCategory, 'campus'>;
  descricao: string;
  /** "osm": posição do OpenStreetMap; "aproximado": conferir no local. */
  fonte: 'osm' | 'aproximado';
  lat: number;
  lng: number;
}

interface Feature {
  properties: { id: string; nome: string; categoria: PlaceCategory; descricao: string; fonte: 'osm' | 'aproximado' };
  geometry: { type: 'Point'; coordinates: [number, number] } | { type: 'Polygon'; coordinates: [number, number][][] };
}

const collection = JSON.parse(raw) as { features: Feature[] };

/** Contorno do campus como [lat, lng][] (formato do Leaflet). */
export const CAMPUS_OUTLINE: [number, number][] = (() => {
  const campus = collection.features.find((f) => f.properties.categoria === 'campus');
  if (!campus || campus.geometry.type !== 'Polygon') return [];
  return campus.geometry.coordinates[0].map(([lng, lat]) => [lat, lng]);
})();

export const PLACES: CampusPlace[] = collection.features
  .filter((f): f is Feature & { geometry: { type: 'Point'; coordinates: [number, number] } } =>
    f.geometry.type === 'Point',
  )
  .map((f) => ({
    id: f.properties.id,
    nome: f.properties.nome,
    categoria: f.properties.categoria as CampusPlace['categoria'],
    descricao: f.properties.descricao,
    fonte: f.properties.fonte,
    lng: f.geometry.coordinates[0],
    lat: f.geometry.coordinates[1],
  }));

/** Centro aproximado do campus (média dos vértices do contorno). */
export const CAMPUS_CENTER: [number, number] = CAMPUS_OUTLINE.length
  ? [
      CAMPUS_OUTLINE.reduce((s, p) => s + p[0], 0) / CAMPUS_OUTLINE.length,
      CAMPUS_OUTLINE.reduce((s, p) => s + p[1], 0) / CAMPUS_OUTLINE.length,
    ]
  : [-15.8205, -48.07];

export const placeById = (id: string | undefined) => PLACES.find((p) => p.id === id);
