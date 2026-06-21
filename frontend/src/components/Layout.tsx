import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-[var(--border)] bg-[var(--bg-elevated)]/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-5 flex justify-between items-baseline">
          <Link to="/" className="no-underline">
            <h1 className="text-2xl md:text-3xl italic text-[var(--text)] hover:text-[var(--accent)] transition-colors duration-300">
              Archivo de Estudio
            </h1>
          </Link>
          <div className="font-[family-name:var(--font-display)] text-xs text-[var(--text-muted)] tracking-wide uppercase">
            {isHome ? 'Índice' : location.pathname.split('/').filter(Boolean).join(' / ')}
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-10 md:px-6 md:py-16">
        <div className="max-w-4xl mx-auto">{children}</div>
      </main>

      <footer className="border-t border-[var(--border)] bg-[var(--bg-elevated)]/50 mt-auto">
        <div className="max-w-4xl mx-auto px-6 py-6 flex justify-between items-center text-xs text-[var(--text-muted)] font-[family-name:var(--font-display)] uppercase tracking-widest">
          <span>Sistema de memorización activa</span>
          <span>Est. 2026</span>
        </div>
      </footer>
    </div>
  );
}
