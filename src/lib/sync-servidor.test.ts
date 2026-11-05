import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
// @ts-expect-error módulo .mjs sem tipos
import { generated } from '../../scripts/sync-servidor.mjs';

describe('dados do servidor do assistente', () => {
  it('estão sincronizados com os do site (rode npm run sync:servidor)', () => {
    const files = generated() as Record<string, string>;
    for (const [name, content] of Object.entries(files)) {
      const onDisk = readFileSync(join(process.cwd(), 'supabase/functions/assistente/_shared', name), 'utf8');
      expect(onDisk, name).toBe(content);
    }
  });
});
