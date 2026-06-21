import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b-[2px] border-[var(--border)] bg-[var(--bg)]">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="no-underline">
            <h1 className="text-lg md:text-xl font-bold tracking-tighter hover:text-[var(--accent)] transition-colors">
              ARCHIVO DE ESTUDIO
            </h1>
          </Link>
          <div className="font-[family-name:var(--font-display)] text-xs md:text-sm text-[var(--text-muted)]">
            FICHAS: {isHome ? 'INDEX' : location.pathname.toUpperCase()}
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-8 md:px-6 md:py-12">
        <div className="max-w-5xl mx-auto">{children}</div>
      </main>

      <footer className="border-t-[2px] border-[var(--border)] bg-[var(--bg)] mt-auto">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center text-[10px] md:text-xs font-[family-name:var(--font-display)] text-[var(--text-muted)] uppercase">
          <span>Sistema de Memorización Activa</span>
          <span>v1.0</span>
        </div>
      </footer>
    </div>
  );
}
