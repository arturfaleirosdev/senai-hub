// Copia os dados de exemplo do site para a função do assistente (Deno),
// para a IA enxergar exatamente os mesmos eventos, vagas e locais.
// Uso: npm run sync:servidor
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dest = join(root, 'supabase/functions/assistente/_shared');
const HEADER = '// ARQUIVO GERADO por scripts/sync-servidor.mjs. Não edite: altere o original em src/ e rode `npm run sync:servidor`.\n';

export function generated() {
  const read = (p) => readFileSync(join(root, p), 'utf8');
  const geojson = JSON.parse(read('src/data/campus-locais.geojson'));
  return {
    'datetime.ts': HEADER + read('src/lib/datetime.ts'),
    'sample.ts': HEADER + read('src/data/sample.ts').replace("from '../lib/datetime';", "from './datetime.ts';"),
    'locais.ts': HEADER + `export const LOCAIS = ${JSON.stringify(geojson, null, 2)} as const;\n`,
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  for (const [name, content] of Object.entries(generated())) writeFileSync(join(dest, name), content);
  console.log('Arquivos do servidor atualizados em supabase/functions/assistente/_shared');
}
