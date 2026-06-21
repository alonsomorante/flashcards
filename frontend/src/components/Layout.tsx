import { Link } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { theme, toggle } = useTheme();

  return (
    <div className="min-h-screen">
      <header className="border-b border-[var(--border)] bg-[var(--bg)] theme-transition">
        <div className="max-w-4xl mx-auto px-6 py-5 flex justify-between items-center">
          <Link to="/" className="no-underline">
            <h1 className="text-xl font-semibold tracking-tight text-[var(--text)] hover:text-[var(--text-muted)] transition-colors duration-200">
              Flashcards
            </h1>
          </Link>

          <button
            onClick={toggle}
            className="w-9 h-9 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[var(--detail)] transition-all duration-200 flex items-center justify-center"
            aria-label={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
          >
            {theme === 'light' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            )}
          </button>
        </div>
      </header>

      <main className="px-4 py-10 md:px-6 md:py-12">
        <div className="max-w-4xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
