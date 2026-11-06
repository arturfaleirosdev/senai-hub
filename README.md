# SENAI Hub Taguatinga

Portal do aluno do SENAI Taguatinga (Brasília-DF). Esta primeira etapa é a **landing page / dashboard**,
um site 100% estático publicado no **GitHub Pages**, sem login e sem back-end.

> Projeto acadêmico, não é um canal oficial do SENAI. Eventos, vagas e avisos são **dados de exemplo**.

## O que tem na página

- **Relógio e data ao vivo** no cabeçalho, sempre no horário de Brasília (`America/Sao_Paulo`),
  mesmo que o aparelho esteja em outro fuso.
- **Próximo evento** com contagem regressiva (muda para "Acontecendo agora" quando começa).
- **Acesso rápido** aos módulos: Calendário, Notificações, Vagas, Mapa do campus e Assistente IA
  (os dois últimos marcados como "Em breve").
- **Próximos eventos** agrupados por dia (Hoje, Amanhã…), com botão para **exportar .ics**
  (Google Agenda, Outlook, celular) e alarme de 1 hora antes.
- **Últimas notificações** com filtro por categoria, marcar como lida/não lida e "marcar todas".
  O estado fica salvo no navegador (localStorage) e o contador do sino é atualizado na hora.
- **Vagas em destaque** com tipo, empresa, local/modalidade, cursos, requisitos (semestre, idade,
  matrícula ativa), ocupação do limite de candidaturas e prazo.
- Mobile-first, navegação inferior no celular, link "Pular para o conteúdo", foco visível no teclado,
  `aria-label`s e respeito a `prefers-reduced-motion`.

- **Mapa do campus** (Leaflet + OpenStreetMap): contorno do campus e blocos reais do OSM, busca, filtro
  por categoria, popup com os eventos de cada local, **Como chegar** (rota a pé no OpenStreetMap),
  **App de mapas** do celular e **Minha localização** (só com permissão do aluno). Cada evento tem o
  botão "ver no mapa", que abre o local certo.
- **Assistente com IA** (Google Gemini, família Flash): chat flutuante em todas as telas, que responde
  sobre agenda, vagas, locais do campus e dúvidas de estudo e carreira, usando os dados do portal.

Os dados de exemplo ficam em `src/data/sample.ts`. As datas são geradas **relativas ao momento em que a
página abre**, então a demonstração nunca fica com eventos vencidos.

## Tecnologias

React 19 + Vite + TypeScript + Tailwind CSS 4, ícones `lucide-react` e fontes Inter e Plus Jakarta Sans
(Google Fonts). Testes com Vitest.

## Rodar localmente

Requer Node.js 20 ou mais recente.

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # testes de fuso horário e .ics
npm run build      # gera a pasta dist/
npm run preview    # serve o build em http://localhost:4173
npm run build:arquivo  # gera dist-arquivo/index.html: arquivo único que abre com dois cliques
```

> Dar dois cliques no `index.html` da raiz **não funciona**: ele é o código-fonte e precisa do Vite.
> Para abrir sem instalar nada, use o arquivo gerado por `npm run build:arquivo`.

## Publicar no GitHub Pages

O repositório já traz o workflow `.github/workflows/deploy.yml`, que testa, gera o build e publica a
cada push na branch `main`. O `vite.config.ts` usa `base: './'`, então funciona com qualquer nome de
repositório.

1. Crie um repositório no GitHub (público, para o Pages grátis) e envie o código para a branch `main`.
2. No GitHub, abra **Settings → Pages** e, em **Build and deployment → Source**, escolha **GitHub Actions**.
3. Acompanhe a aba **Actions**. Ao terminar, o site fica em
   `https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/`.

Para publicar de novo, basta fazer push na `main` (ou rodar o workflow manualmente em **Actions**).

## Mapa: onde ajustar os locais

Todos os pontos estão em **`src/data/campus-locais.geojson`** (coordenadas em `[longitude, latitude]`).
Os blocos A, B, C, E/F, G e H, o auditório, a biblioteca, a cantina e o estacionamento vêm do
OpenStreetMap (`"fonte": "osm"`). Entrada, pátio, banheiros e rampa não estão no OSM
(`"fonte": "aproximado"`) e aparecem com `*`: confira no local e ajuste as coordenadas.
Os tiles são do OpenStreetMap, com a atribuição visível, como pede a política de uso.

Depois de editar o GeoJSON ou os dados de exemplo, rode `npm run sync:servidor` para o assistente
enxergar a mesma informação (um teste avisa se você esquecer).

## Assistente com IA: como ligar

A chave do Gemini **nunca** vai para o site: o chat chama a função `supabase/functions/assistente`,
que roda no Supabase (plano gratuito) e fala com o Gemini.

1. **Chave do Gemini (grátis):** entre em https://aistudio.google.com/apikey com uma conta Google e
   clique em **Create API key**.
2. **Projeto no Supabase (grátis):** crie um projeto em https://supabase.com/dashboard.
3. **Banco:** em **SQL Editor**, rode o arquivo `supabase/migrations/20261105120000_assistente_limites.sql`
   (cria o controle de limite de mensagens).
4. **Função:** com o [Supabase CLI](https://supabase.com/docs/guides/cli), rode
   `supabase functions deploy assistente --no-verify-jwt --project-ref SEU_PROJECT_REF`.
5. **Segredo:** em **Edge Functions → Secrets**, crie `GEMINI_API_KEY` com a chave do passo 1.
   Opcionais: `GEMINI_MODEL` (padrão `gemini-3.5-flash,gemini-flash-latest`; se nenhum existir, a função escolhe sozinha o Flash mais recente da sua chave), `LIMITE_DIARIO`
   (padrão 20 mensagens por aparelho/dia), `LIMITE_GLOBAL` (padrão 300/dia) e `ORIGENS_PERMITIDAS`.
6. **Site:** coloque o endereço `https://SEU_PROJECT_REF.supabase.co/functions/v1/assistente` em
   `src/config.ts` (ou na variável `VITE_ASSISTENTE_URL` do build) e publique de novo.

Proteções: limite por aparelho e global por dia (guardando só um hash do IP), pergunta de até
500 caracteres, histórico curto, CORS só para os sites permitidos, mensagem amigável quando a cota
gratuita acaba e aviso de que a IA pode errar. Para a IA vão só a pergunta, a conversa recente e os
dados públicos do portal. Projetos gratuitos do Supabase pausam após cerca de 7 dias sem uso; é só
reativar no painel.

## Estrutura

```
src/
├─ App.tsx                 monta a página
├─ components/             Header, Hero, QuickAccess, UpcomingEvents, LatestNotifications,
│                          FeaturedJobs, BottomNav, Footer, Logo, SectionHeader
├─ data/sample.ts          dados de exemplo (trocar por API no futuro)
├─ data/campus-locais.geojson  locais do mapa (editável)
├─ components/CampusMap.tsx    mapa Leaflet + OSM
├─ components/Assistant.tsx    chat do assistente
├─ hooks/                  useNow (relógio), useReadNotifications (lidas/não lidas)
└─ lib/                    datetime.ts (fuso de Brasília), ics.ts (exportação), categories.ts
```

## Próximas etapas

Login, calendário completo (mês/semana/dia), notificações em tempo real e candidatura a vagas com
travas no servidor. Essas partes também usarão o Supabase.
