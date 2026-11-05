import { useMemo, useState } from 'react';
import { BottomNav } from './components/BottomNav';
import { FeaturedJobs } from './components/FeaturedJobs';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { LatestNotifications } from './components/LatestNotifications';
import { QuickAccess } from './components/QuickAccess';
import { UpcomingEvents } from './components/UpcomingEvents';
import { buildEvents, buildJobs, buildNotifications } from './data/sample';
import { useReadNotifications } from './hooks/useReadNotifications';

const WEEK = 7 * 24 * 60 * 60 * 1000;

export default function App() {
  // Os dados de exemplo são gerados uma vez, relativos ao momento de abertura.
  const [openedAt] = useState(() => new Date());
  const events = useMemo(
    () => buildEvents(openedAt).sort((a, b) => a.start.getTime() - b.start.getTime()),
    [openedAt],
  );
  const notifications = useMemo(() => buildNotifications(openedAt), [openedAt]);
  const jobs = useMemo(() => buildJobs(openedAt), [openedAt]);
  const read = useReadNotifications(notifications);

  const eventsThisWeek = events.filter(
    (e) => e.end.getTime() > openedAt.getTime() && e.start.getTime() < openedAt.getTime() + WEEK,
  ).length;
  const openJobs = jobs.filter((j) => j.deadline.getTime() > openedAt.getTime()).length;

  return (
    <>
      <a
        href="#conteudo"
        className="sr-only z-50 rounded-lg bg-brand-800 px-4 py-2 font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Pular para o conteúdo
      </a>
      <Header unreadCount={read.unreadCount} />
      <main id="conteudo">
        <Hero events={events} />
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <QuickAccess eventsThisWeek={eventsThisWeek} unreadCount={read.unreadCount} openJobs={openJobs} />
          <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:gap-8">
            <UpcomingEvents events={events} />
            <LatestNotifications
              notifications={notifications}
              isRead={read.isRead}
              markRead={read.markRead}
              markAllRead={read.markAllRead}
              unreadCount={read.unreadCount}
            />
          </div>
          <div className="mt-10">
            <FeaturedJobs jobs={jobs} />
          </div>
        </div>
      </main>
      <Footer />
      <BottomNav unreadCount={read.unreadCount} />
    </>
  );
}
