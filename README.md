# SmartCampus SENAI Taguatinga

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

Os dados de exemplo ficam em `src/data/sample.ts`. As datas são geradas **relativas ao momento em que a
página abre**, então a demonstração nunca fica com eventos vencidos.

## Tecnologias

React 19 + Vite + TypeScript + Tailwind CSS 4, ícones `lucide-react` e fontes Inter e Plus Jakarta Sans
(empacotadas, sem chamadas externas). Testes com Vitest.

## Rodar localmente

Requer Node.js 20 ou mais recente.

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # testes de fuso horário e .ics
npm run build      # gera a pasta dist/
npm run preview    # serve o build em http://localhost:4173
```

## Publicar no GitHub Pages

O repositório já traz o workflow `.github/workflows/deploy.yml`, que testa, gera o build e publica a
cada push na branch `main`. O `vite.config.ts` usa `base: './'`, então funciona com qualquer nome de
repositório.

1. Crie um repositório no GitHub (por exemplo `smartcampus-senai-taguatinga`) e envie o código:
   ```bash
   git remote add origin https://github.com/SEU-USUARIO/smartcampus-senai-taguatinga.git
   git push -u origin main
   ```
2. No GitHub, abra **Settings → Pages** e, em **Build and deployment → Source**, escolha **GitHub Actions**.
3. Acompanhe a aba **Actions**. Ao terminar, o site fica em
   `https://SEU-USUARIO.github.io/smartcampus-senai-taguatinga/`.

Para publicar de novo, basta fazer push na `main` (ou rodar o workflow manualmente em **Actions**).

## Estrutura

```
src/
├─ App.tsx                 monta a página
├─ components/             Header, Hero, QuickAccess, UpcomingEvents, LatestNotifications,
│                          FeaturedJobs, BottomNav, Footer, Logo, SectionHeader
├─ data/sample.ts          dados de exemplo (trocar por API no futuro)
├─ hooks/                  useNow (relógio), useReadNotifications (lidas/não lidas)
└─ lib/                    datetime.ts (fuso de Brasília), ics.ts (exportação), categories.ts
```

## Próximas etapas

Calendário completo (mês/semana/dia), notificações em tempo real, candidatura a vagas com travas no
servidor, mapa do campus com OpenStreetMap e assistente com IA. Essas partes precisam de back-end
(por exemplo Supabase) e não rodam só no GitHub Pages.
