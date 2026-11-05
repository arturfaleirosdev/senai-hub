// ARQUIVO GERADO por scripts/sync-servidor.mjs. Não edite: altere o original em src/ e rode `npm run sync:servidor`.
export const LOCAIS = {
  "type": "FeatureCollection",
  "_comentario": "EDITE AQUI as posições dos locais do campus. Coordenadas no formato [longitude, latitude]. Locais com \"fonte\": \"osm\" vêm do OpenStreetMap (campo \"osm\" = elemento de origem); os com \"fonte\": \"aproximado\" não estão no OSM e foram posicionados à mão: confira no local.",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "id": "campus",
        "nome": "SENAI Taguatinga",
        "categoria": "campus",
        "descricao": "Contorno do campus no OpenStreetMap.",
        "fonte": "osm",
        "osm": "way/1058741264"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              -48.0711651,
              -15.8201964
            ],
            [
              -48.0707533,
              -15.8213613
            ],
            [
              -48.068952,
              -15.820772
            ],
            [
              -48.0691854,
              -15.8201105
            ],
            [
              -48.0692194,
              -15.8200156
            ],
            [
              -48.0692412,
              -15.8199556
            ],
            [
              -48.0692463,
              -15.8199396
            ],
            [
              -48.069364,
              -15.8196068
            ],
            [
              -48.0711651,
              -15.8201964
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "secretaria",
        "nome": "Bloco A · Secretaria e SOE",
        "categoria": "servicos",
        "descricao": "Secretaria acadêmica e Serviço de Orientação Educacional: matrícula, rematrícula, declarações e inscrições.",
        "fonte": "osm",
        "osm": "way/1058741288"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [
          -48.0695382,
          -15.820087
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "bloco-b",
        "nome": "Bloco B · Vestuário",
        "categoria": "laboratorio",
        "descricao": "Salas e laboratórios da área de Vestuário.",
        "fonte": "osm",
        "osm": "way/1058741284"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [
          -48.0699216,
          -15.82016
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "bloco-c",
        "nome": "Bloco C · Alimentos e Bebidas",
        "categoria": "laboratorio",
        "descricao": "Salas e laboratórios da área de Alimentos e Bebidas.",
        "fonte": "osm",
        "osm": "way/1058741281"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [
          -48.0704865,
          -15.8203085
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "bloco-ef",
        "nome": "Blocos E e F · Automação, TI, Telecom e Refrigeração",
        "categoria": "laboratorio",
        "descricao": "Laboratório de Automação (CLP), laboratórios de TI e redes, telecomunicações e refrigeração. Salas de aula e avaliação, como a Sala 12.",
        "fonte": "osm",
        "osm": "way/1058741286"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [
          -48.0691226,
          -15.8205495
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "bloco-g",
        "nome": "Bloco G · Construção civil e Oficinas",
        "categoria": "oficina",
        "descricao": "Oficinas de construção civil, marcenaria, lanternagem e pintura. Uso obrigatório de EPI.",
        "fonte": "osm",
        "osm": "way/1058741278"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [
          -48.0703963,
          -15.820816
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "bloco-h",
        "nome": "Bloco H",
        "categoria": "academico",
        "descricao": "Bloco de salas do campus.",
        "fonte": "osm",
        "osm": "way/1058741293"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [
          -48.0707055,
          -15.82097
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "auditorio",
        "nome": "Auditório",
        "categoria": "convivencia",
        "descricao": "Palestras, aulas magnas e apresentações.",
        "fonte": "osm",
        "osm": "node/9728509635"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [
          -48.0706079,
          -15.820201
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "biblioteca",
        "nome": "Biblioteca SENAI",
        "categoria": "servicos",
        "descricao": "Acervo técnico, estudo individual e sala multiuso para oficinas.",
        "fonte": "osm",
        "osm": "way/1058741295"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [
          -48.070942,
          -15.820316
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "cantina",
        "nome": "Cantina",
        "categoria": "alimentacao",
        "descricao": "Lanches, refeições rápidas e café.",
        "fonte": "osm",
        "osm": "node/9728509636"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [
          -48.0703071,
          -15.8200788
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "estacionamento",
        "nome": "Estacionamento",
        "categoria": "estacionamento",
        "descricao": "Estacionamento ao lado do campus.",
        "fonte": "osm",
        "osm": "way/1058741304"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [
          -48.0693551,
          -15.8214576
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "patio",
        "nome": "Pátio central",
        "categoria": "convivencia",
        "descricao": "Área aberta de convivência entre os blocos. Recebe a Feira de Profissões.",
        "fonte": "aproximado"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [
          -48.06984,
          -15.82047
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "entrada-principal",
        "nome": "Entrada principal (portaria)",
        "categoria": "entrada",
        "descricao": "Portaria e acesso de pedestres. Apresente a carteirinha na entrada.",
        "fonte": "aproximado"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [
          -48.06983,
          -15.82105
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "banheiros",
        "nome": "Banheiros",
        "categoria": "banheiro",
        "descricao": "Banheiros masculino e feminino próximos ao pátio.",
        "fonte": "aproximado"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [
          -48.0697,
          -15.82035
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "banheiro-acessivel",
        "nome": "Banheiro acessível",
        "categoria": "acessibilidade",
        "descricao": "Banheiro adaptado para pessoas com deficiência. O campus é marcado como acessível no OSM.",
        "fonte": "aproximado"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [
          -48.07002,
          -15.82061
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "rampa",
        "nome": "Rampa de acesso",
        "categoria": "acessibilidade",
        "descricao": "Rampa entre a portaria e o pátio central.",
        "fonte": "aproximado"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [
          -48.06976,
          -15.82086
        ]
      }
    }
  ]
} as const;
