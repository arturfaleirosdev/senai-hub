import {
  Award,
  BookOpen,
  Briefcase,
  CalendarClock,
  ClipboardCheck,
  Hourglass,
  Megaphone,
  PartyPopper,
  Presentation,
  Store,
  type LucideIcon,
} from 'lucide-react';
import type { EventCategory, JobModality, JobType, NotificationCategory } from '../data/sample';

interface CategoryMeta {
  label: string;
  icon: LucideIcon;
  /** Classes Tailwind para o chip/ícone da categoria. */
  tone: string;
}

export const EVENT_CATEGORIES: Record<EventCategory, CategoryMeta> = {
  aula: { label: 'Aula', icon: BookOpen, tone: 'bg-brand-50 text-brand-700 ring-brand-200' },
  prova: { label: 'Prova', icon: ClipboardCheck, tone: 'bg-accent-50 text-accent-700 ring-accent-200' },
  palestra: { label: 'Palestra', icon: Presentation, tone: 'bg-violet-50 text-violet-700 ring-violet-200' },
  feira: { label: 'Feira', icon: Store, tone: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  prazo: { label: 'Prazo', icon: Hourglass, tone: 'bg-amber-50 text-amber-800 ring-amber-200' },
  evento: { label: 'Evento', icon: PartyPopper, tone: 'bg-sky-50 text-sky-700 ring-sky-200' },
};

export const NOTIFICATION_CATEGORIES: Record<NotificationCategory, CategoryMeta> = {
  eventos: { label: 'Eventos', icon: CalendarClock, tone: 'bg-brand-50 text-brand-700 ring-brand-200' },
  vagas: { label: 'Vagas', icon: Briefcase, tone: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  avisos: { label: 'Avisos do campus', icon: Megaphone, tone: 'bg-amber-50 text-amber-800 ring-amber-200' },
  candidaturas: { label: 'Candidaturas', icon: Award, tone: 'bg-violet-50 text-violet-700 ring-violet-200' },
};

export const JOB_TYPES: Record<JobType, string> = {
  estagio: 'Estágio',
  emprego: 'Emprego',
  jovem_aprendiz: 'Jovem Aprendiz',
};

export const JOB_MODALITIES: Record<JobModality, string> = {
  presencial: 'Presencial',
  hibrido: 'Híbrido',
  remoto: 'Remoto',
};

export const PLACE_CATEGORIES: Record<
  'entrada' | 'estacionamento' | 'servicos' | 'convivencia' | 'alimentacao' | 'academico' | 'laboratorio' | 'oficina' | 'banheiro' | 'acessibilidade',
  { label: string; color: string }
> = {
  academico: { label: 'Blocos e salas', color: '#004a8d' },
  laboratorio: { label: 'Laboratórios', color: '#7c3aed' },
  oficina: { label: 'Oficinas', color: '#b45309' },
  servicos: { label: 'Secretaria e biblioteca', color: '#0e7490' },
  convivencia: { label: 'Auditório e pátio', color: '#be185d' },
  alimentacao: { label: 'Cantina', color: '#ca8a04' },
  entrada: { label: 'Entradas', color: '#d40c18' },
  estacionamento: { label: 'Estacionamento', color: '#475569' },
  banheiro: { label: 'Banheiros', color: '#0891b2' },
  acessibilidade: { label: 'Acessibilidade', color: '#15803d' },
};
