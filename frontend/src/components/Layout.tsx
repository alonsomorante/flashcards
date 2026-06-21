import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const isHome = location.pathname === '/';

  const pathDisplay = isHome
    ? '~/estudio'
    : `~/estudio${location.pathname.replace(/\//g, '/')}`;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-[var(--border-dim)] bg-[var(--bg)]">
        <div className="max-w-4xl mx-auto px-4 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <Link to="/" className="no-underline">
            <h1 className="text-lg md:text-xl text-[var(--text)] animate-flicker">
              <span className="text-[var(--accent)]">root</span>@estudio:~$
            </h1>
          </Link>
          <div className="font-[family-name:var(--font-display)] text-xs text-[var(--text-dim)]">
            {pathDisplay}
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 md:px-6 md:py-10">
        <div className="max-w-4xl mx-auto">{children}</div>
      </main>

      <footer className="border-t border-[var(--border-dim)] bg-[var(--bg)] mt-auto">
        <div className="max-w-4xl mx-auto px-4 py-2 flex justify-between items-center text-[10px] text-[var(--text-muted)] font-[family-name:var(--font-display)]">
          <span>SYS: MEMORIZATION_PROTOCOL_v1.0</span>
          <span className="animate-blink">_</span>
        </div>
      </footer>
    </div>
  );
}
