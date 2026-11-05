import { Building2, GraduationCap, Lock, MapPin, Timer } from 'lucide-react';
import type { Job } from '../data/sample';
import { useNow } from '../hooks/useNow';
import { JOB_MODALITIES, JOB_TYPES } from '../lib/categories';
import { calendarDayDiff, formatDeadline } from '../lib/datetime';
import { SectionHeader } from './SectionHeader';

interface FeaturedJobsProps {
  jobs: Job[];
}

const TYPE_TONE: Record<Job['type'], string> = {
  estagio: 'bg-brand-50 text-brand-700 ring-brand-200',
  emprego: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  jovem_aprendiz: 'bg-violet-50 text-violet-700 ring-violet-200',
};

function requirements(job: Job): string[] {
  const list: string[] = [];
  if (job.minSemester) list.push(`A partir do ${job.minSemester}º semestre`);
  if (job.minAge) list.push(`${job.minAge}+ anos`);
  if (job.requiresActiveEnrollment) list.push('Matrícula ativa');
  return list;
}

export function FeaturedJobs({ jobs }: FeaturedJobsProps) {
  const now = useNow(60_000);

  return (
    <section aria-labelledby="vagas-title" id="vagas">
      <SectionHeader id="vagas-title" eyebrow="Vagas de emprego e estágio" title="Vagas em destaque" />

      <ul className="grid gap-3 sm:grid-cols-2">
        {jobs.map((job) => {
          const closed = job.deadline.getTime() <= now.getTime();
          const urgent = !closed && calendarDayDiff(now, job.deadline) <= 2;
          const full = job.maxApplications !== undefined && job.applications >= job.maxApplications;
          const fill = job.maxApplications ? Math.min(100, (job.applications / job.maxApplications) * 100) : 0;
          return (
            <li key={job.id}>
              <article
                aria-labelledby={`${job.id}-title`}
                className="flex h-full flex-col rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80 sm:p-5"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ${TYPE_TONE[job.type]}`}>
                    {JOB_TYPES[job.type]}
                  </span>
                  <span className="text-xs font-medium text-slate-500">{job.area}</span>
                </div>

                <h3 id={`${job.id}-title`} className="mt-2.5 font-display text-lg font-bold leading-snug text-brand-950">
                  {job.title}
                </h3>

                <dl className="mt-2 space-y-1 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <dt className="sr-only">Empresa</dt>
                    <Building2 className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                    <dd>{job.company}</dd>
                  </div>
                  <div className="flex items-center gap-2">
                    <dt className="sr-only">Local e modalidade</dt>
                    <MapPin className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                    <dd>
                      {job.city} · {JOB_MODALITIES[job.modality]}
                    </dd>
                  </div>
                  <div className="flex items-center gap-2">
                    <dt className="sr-only">Cursos</dt>
                    <GraduationCap className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                    <dd>{job.courses.length ? job.courses.join(', ') : 'Todos os cursos'}</dd>
                  </div>
                </dl>

                {requirements(job).length > 0 && (
                  <ul aria-label="Requisitos de elegibilidade" className="mt-3 flex flex-wrap gap-1.5">
                    {requirements(job).map((req) => (
                      <li
                        key={req}
                        className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600"
                      >
                        <Lock className="h-3 w-3" aria-hidden="true" />
                        {req}
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-auto pt-4">
                  {job.maxApplications !== undefined && (
                    <div className="mb-3">
                      <div className="mb-1 flex justify-between text-xs text-slate-500">
                        <span>Candidaturas</span>
                        <span className="tabular font-semibold">
                          {job.applications}/{job.maxApplications}
                        </span>
                      </div>
                      <div
                        className="h-1.5 overflow-hidden rounded-full bg-slate-100"
                        role="progressbar"
                        aria-label="Candidaturas recebidas"
                        aria-valuemin={0}
                        aria-valuemax={job.maxApplications}
                        aria-valuenow={job.applications}
                      >
                        <div
                          className={`h-full rounded-full ${fill >= 75 ? 'bg-accent-600' : 'bg-brand-600'}`}
                          style={{ width: `${fill}%` }}
                        />
                      </div>
                    </div>
                  )}
                  <p
                    className={`flex items-center gap-1.5 text-sm font-semibold ${
                      closed || full ? 'text-slate-400' : urgent ? 'text-accent-600' : 'text-brand-700'
                    }`}
                  >
                    <Timer className="h-4 w-4" aria-hidden="true" />
                    {full ? 'Limite de candidaturas atingido' : formatDeadline(job.deadline, now)}
                  </p>
                </div>
              </article>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-xs text-slate-500">
        A candidatura pelo portal, com checagem automática dos requisitos, chega na próxima etapa do projeto.
      </p>
    </section>
  );
}
