/**
 * DADOS DE EXEMPLO para demonstração da landing page.
 *
 * As datas são geradas em relação ao momento em que a página abre (sempre no
 * fuso America/Sao_Paulo), para a demonstração nunca ficar com eventos
 * vencidos. Nomes de empresas e eventos são fictícios.
 *
 * Quando o back-end existir, estas funções serão trocadas por consultas à API.
 */
import { atDayOffset } from '../lib/datetime';

export type EventCategory = 'aula' | 'prova' | 'palestra' | 'feira' | 'prazo' | 'evento';

export interface CampusEvent {
  id: string;
  title: string;
  description: string;
  start: Date;
  end: Date;
  category: EventCategory;
  location: string;
  audience: string;
}

export type NotificationCategory = 'eventos' | 'vagas' | 'avisos' | 'candidaturas';

export interface CampusNotification {
  id: string;
  category: NotificationCategory;
  title: string;
  body: string;
  createdAt: Date;
  initiallyRead: boolean;
}

export type JobType = 'estagio' | 'emprego' | 'jovem_aprendiz';
export type JobModality = 'presencial' | 'hibrido' | 'remoto';

export interface Job {
  id: string;
  title: string;
  company: string;
  type: JobType;
  area: string;
  city: string;
  modality: JobModality;
  deadline: Date;
  courses: string[];
  minSemester?: number;
  minAge?: number;
  requiresActiveEnrollment?: boolean;
  applications: number;
  maxApplications?: number;
}

const MIN = 60_000;
const HOUR = 60 * MIN;

/** Próxima meia hora cheia a partir de `now` + `hours`. */
function inHours(now: Date, hours: number): Date {
  const target = now.getTime() + hours * HOUR;
  return new Date(Math.ceil(target / (30 * MIN)) * 30 * MIN);
}

export function buildEvents(now: Date): CampusEvent[] {
  const palestraStart = inHours(now, 2);
  return [
    {
      id: 'evt-palestra-industria',
      title: 'Palestra: Indústria 4.0 e o mercado de trabalho no DF',
      description: 'Bate-papo com profissionais da indústria sobre automação, dados e carreiras técnicas.',
      start: palestraStart,
      end: new Date(palestraStart.getTime() + 90 * MIN),
      category: 'palestra',
      location: 'Auditório principal',
      audience: 'Todos os cursos',
    },
    {
      id: 'evt-prova-eletricidade',
      title: 'Prova: Eletricidade Básica',
      description: 'Avaliação do módulo 2. Traga calculadora científica e documento com foto.',
      start: atDayOffset(now, 1, 8, 0),
      end: atDayOffset(now, 1, 10, 0),
      category: 'prova',
      location: 'Bloco B · Sala 12',
      audience: 'Técnico em Eletrotécnica · Turma ELT-2A',
    },
    {
      id: 'evt-oficina-curriculo',
      title: 'Oficina de currículo e LinkedIn',
      description: 'Monte um currículo objetivo e aprenda a se apresentar para vagas de estágio.',
      start: atDayOffset(now, 1, 14, 0),
      end: atDayOffset(now, 1, 16, 0),
      category: 'palestra',
      location: 'Biblioteca · Sala multiuso',
      audience: 'Todos os cursos',
    },
    {
      id: 'evt-prazo-estagio-dev',
      title: 'Prazo: Estágio em Desenvolvimento Web',
      description: 'Último dia para se candidatar à vaga de estágio da Cerrado Code Software.',
      start: atDayOffset(now, 2, 23, 0),
      end: atDayOffset(now, 2, 23, 59),
      category: 'prazo',
      location: 'Online · Portal de vagas',
      audience: 'Técnico em Desenvolvimento de Sistemas',
    },
    {
      id: 'evt-aula-clp',
      title: 'Aula prática: CLP e automação industrial',
      description: 'Programação de controladores lógicos em bancada. Uso obrigatório de EPI.',
      start: atDayOffset(now, 3, 19, 0),
      end: atDayOffset(now, 3, 22, 0),
      category: 'aula',
      location: 'Laboratório de Automação',
      audience: 'Técnico em Mecatrônica · Turma MEC-3N',
    },
    {
      id: 'evt-feira-profissoes',
      title: 'Feira de Profissões SENAI',
      description: 'Estandes de empresas parceiras, demonstrações dos cursos e oficinas rápidas.',
      start: atDayOffset(now, 5, 9, 0),
      end: atDayOffset(now, 5, 17, 0),
      category: 'feira',
      location: 'Pátio central',
      audience: 'Aberto à comunidade',
    },
    {
      id: 'evt-hackathon',
      title: 'Hackathon interno: soluções para o campus',
      description: 'Equipes de até 4 alunos. Inscrições na secretaria até a véspera.',
      start: atDayOffset(now, 7, 9, 0),
      end: atDayOffset(now, 7, 18, 0),
      category: 'evento',
      location: 'Bloco C · Laboratórios de Informática',
      audience: 'Todos os cursos',
    },
    {
      id: 'evt-rematricula',
      title: 'Rematrícula 2027/1: último dia',
      description: 'Confirme sua rematrícula na secretaria acadêmica ou pelo portal.',
      start: atDayOffset(now, 9, 8, 0),
      end: atDayOffset(now, 9, 20, 0),
      category: 'prazo',
      location: 'Secretaria acadêmica',
      audience: 'Todos os cursos',
    },
  ];
}

export function buildNotifications(now: Date): CampusNotification[] {
  const ago = (minutes: number) => new Date(now.getTime() - minutes * MIN);
  return [
    {
      id: 'ntf-1',
      category: 'avisos',
      title: 'Biblioteca com horário estendido',
      body: 'Na semana de provas a biblioteca funciona até as 22h, de segunda a sexta.',
      createdAt: ago(25),
      initiallyRead: false,
    },
    {
      id: 'ntf-2',
      category: 'vagas',
      title: 'Nova vaga compatível com seu perfil',
      body: 'Estágio em Suporte de TI na Ipê Distribuidora: 20h semanais, presencial em Taguatinga.',
      createdAt: ago(3 * 60),
      initiallyRead: false,
    },
    {
      id: 'ntf-3',
      category: 'candidaturas',
      title: 'Candidatura em análise',
      body: 'Sua candidatura para Jovem Aprendiz – Administrativo passou para "Em análise".',
      createdAt: ago(20 * 60),
      initiallyRead: false,
    },
    {
      id: 'ntf-4',
      category: 'eventos',
      title: 'Evento alterado: Feira de Profissões',
      body: 'O local mudou para o Pátio central. O horário continua das 9h às 17h.',
      createdAt: ago(26 * 60),
      initiallyRead: true,
    },
    {
      id: 'ntf-5',
      category: 'avisos',
      title: 'Manutenção no Wi-Fi do Bloco C',
      body: 'A rede ficará instável entre 7h e 9h. Os laboratórios usam rede cabeada.',
      createdAt: ago(2 * 24 * 60),
      initiallyRead: true,
    },
    {
      id: 'ntf-6',
      category: 'eventos',
      title: 'Novo evento: Hackathon interno',
      body: 'Monte sua equipe e inscreva-se na secretaria. Vagas limitadas.',
      createdAt: ago(3 * 24 * 60),
      initiallyRead: true,
    },
  ];
}

export function buildJobs(now: Date): Job[] {
  return [
    {
      id: 'job-dev-web',
      title: 'Estágio em Desenvolvimento Web',
      company: 'Cerrado Code Software',
      type: 'estagio',
      area: 'Tecnologia da Informação',
      city: 'Brasília-DF',
      modality: 'hibrido',
      deadline: atDayOffset(now, 2, 23, 59),
      courses: ['Desenvolvimento de Sistemas'],
      minSemester: 2,
      minAge: 16,
      requiresActiveEnrollment: true,
      applications: 23,
      maxApplications: 30,
    },
    {
      id: 'job-suporte-ti',
      title: 'Estágio em Suporte de TI',
      company: 'Ipê Distribuidora',
      type: 'estagio',
      area: 'Infraestrutura',
      city: 'Taguatinga-DF',
      modality: 'presencial',
      deadline: atDayOffset(now, 8, 23, 59),
      courses: ['Redes de Computadores', 'Desenvolvimento de Sistemas'],
      minSemester: 1,
      minAge: 16,
      applications: 9,
      maxApplications: 40,
    },
    {
      id: 'job-aprendiz-adm',
      title: 'Jovem Aprendiz – Administrativo',
      company: 'Metalúrgica Vale do Planalto',
      type: 'jovem_aprendiz',
      area: 'Administração',
      city: 'Ceilândia-DF',
      modality: 'presencial',
      deadline: atDayOffset(now, 12, 18, 0),
      courses: [],
      minAge: 14,
      requiresActiveEnrollment: true,
      applications: 41,
    },
    {
      id: 'job-tecnico-eletro',
      title: 'Técnico(a) em Eletrotécnica Júnior',
      company: 'Lume Engenharia Elétrica',
      type: 'emprego',
      area: 'Manutenção elétrica',
      city: 'Águas Claras-DF',
      modality: 'presencial',
      deadline: atDayOffset(now, 15, 23, 59),
      courses: ['Eletrotécnica'],
      minSemester: 3,
      minAge: 18,
      applications: 6,
      maxApplications: 15,
    },
  ];
}
