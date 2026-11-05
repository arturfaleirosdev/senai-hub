import { LogoMark } from './Logo';

export function Footer() {
  return (
    <footer className="mt-14 border-t border-slate-200 bg-white pb-24 lg:pb-0">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-slate-500 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <LogoMark className="h-8 w-8" />
          <div>
            <p className="font-semibold text-brand-950">SmartCampus SENAI Taguatinga</p>
            <p className="text-xs">Portal do aluno · Brasília-DF · horários de Brasília</p>
          </div>
        </div>
        <p className="max-w-md text-xs leading-relaxed">
          Projeto acadêmico em desenvolvimento, não é um canal oficial do SENAI. Eventos, vagas e avisos
          desta página são dados de exemplo para demonstração.
        </p>
      </div>
    </footer>
  );
}
