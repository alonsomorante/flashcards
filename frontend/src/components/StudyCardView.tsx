import type { Flashcard, ReviewLevel } from '../types/index';
import { LEVEL_LABELS } from '../types/index';
import { useTextToSpeech } from '../hooks/useTextToSpeech';

interface StudyCardViewProps {
  card: Flashcard;
  isFlipped: boolean;
  onFlip: () => void;
  onMarkLevel: (level: ReviewLevel) => void;
  position: { current: number; total: number };
}

const SpeakerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
  </svg>
);

const LoadingIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

export function StudyCardView({
  card,
  isFlipped,
  onFlip,
  onMarkLevel,
  position,
}: StudyCardViewProps) {
  const tts = useTextToSpeech();

  const handleFlip = () => {
    tts.stop();
    onFlip();
  };

  const handlePlayFront = (e: React.MouseEvent) => {
    e.stopPropagation();
    void tts.toggle(card.front, card.frontLanguage || 'es-ES');
  };

  const handlePlayBack = (e: React.MouseEvent) => {
    e.stopPropagation();
    void tts.toggle(card.back, card.backLanguage || 'es-ES');
  };

  const renderAudioButton = (isPlaying: boolean, isLoading: boolean, onClick: (e: React.MouseEvent) => void) => (
    <button
      type="button"
      onClick={onClick}
      className="p-2 rounded-full text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/10 transition-colors"
      aria-label={isPlaying ? 'Detener audio' : 'Escuchar pronunciación'}
      title={isPlaying ? 'Detener audio' : 'Escuchar pronunciación'}
    >
      {isLoading ? <LoadingIcon /> : <SpeakerIcon />}
    </button>
  );

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-4 text-sm text-[var(--text-muted)]">
        <span>
          Carta {position.current} de {position.total}
        </span>
        <span className="text-xs font-medium px-2 py-0.5 rounded bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-muted)]">
          {LEVEL_LABELS[card.level as ReviewLevel]}
        </span>
      </div>

      <div className="relative w-full min-h-[420px] perspective-1000">
        <div
          role="button"
          tabIndex={0}
          onClick={handleFlip}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleFlip();
            }
          }}
          className="relative w-full h-full min-h-[420px] transition-transform duration-700 ease-out cursor-pointer"
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 backface-hidden bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-10 md:p-16 flex flex-col items-center justify-center text-center"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="absolute top-4 left-6 right-6 flex justify-between items-center">
              <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">
                Pregunta
              </span>
              {renderAudioButton(
                tts.isPlaying,
                tts.isLoading,
                handlePlayFront
              )}
            </div>
            <p className="text-2xl md:text-4xl font-semibold text-[var(--text)] leading-snug max-w-xl">
              {card.front}
            </p>
            {card.frontPronunciation && (
              <p className="mt-3 text-lg text-[var(--text-muted)] tracking-wide">
                {card.frontPronunciation}
              </p>
            )}
            <span className="absolute bottom-6 text-sm text-[var(--text-muted)]">
              Click para voltear →
            </span>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 backface-hidden bg-[var(--bg-elevated)] border border-[var(--accent)] rounded-lg p-10 md:p-16 flex flex-col items-center justify-center text-center"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <div className="absolute top-4 left-6 right-6 flex justify-between items-center">
              <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">
                Respuesta
              </span>
              {renderAudioButton(
                tts.isPlaying,
                tts.isLoading,
                handlePlayBack
              )}
            </div>
            <p className="text-xl md:text-2xl text-[var(--text-muted)] leading-relaxed max-w-xl">
              {card.back}
            </p>
            {card.backPronunciation && (
              <p className="mt-3 text-lg text-[var(--text-muted)] tracking-wide">
                {card.backPronunciation}
              </p>
            )}
            <span className="absolute bottom-6 text-sm text-[var(--text-muted)]">
              ← Click para volver
            </span>
          </div>
        </div>
      </div>

      {isFlipped && (
        <div className="grid grid-cols-2 gap-3 mt-5 sm:grid-cols-4">
          {([0, 1, 2, 3] as ReviewLevel[]).map((level) => (
            <button
              key={level}
              onClick={() => onMarkLevel(level)}
              className="py-3 border border-[var(--border)] rounded-lg font-medium text-sm text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[var(--accent)] hover:bg-[var(--bg-elevated)] transition-colors duration-200"
            >
              {LEVEL_LABELS[level]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
