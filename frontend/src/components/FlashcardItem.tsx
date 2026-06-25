import { useState } from 'react';
import type { Flashcard } from '../types/index';
import { LEVEL_LABELS } from '../types/index';
import type { ReviewLevel } from '../types/index';
import { useDeleteFlashcard, useUpdateFlashcard } from '../hooks/useFlashcards';
import { useSpellCheck } from '../hooks/useSpellCheck';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { LanguageSelect } from './LanguageSelect';
import { ConfirmDialog } from './ConfirmDialog';

interface FlashcardItemProps {
  flashcard: Flashcard;
  chapterId: string;
  index: number;
}

const SparklesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .962L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
  </svg>
);

const MicIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 19v3" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <rect x="9" y="2" width="6" height="11" rx="3" />
  </svg>
);

export function FlashcardItem({ flashcard, chapterId, index }: FlashcardItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [front, setFront] = useState(flashcard.front);
  const [back, setBack] = useState(flashcard.back);
  const [frontLang, setFrontLang] = useState(flashcard.frontLanguage || 'es-ES');
  const [backLang, setBackLang] = useState(flashcard.backLanguage || 'es-ES');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const updateFlashcard = useUpdateFlashcard();
  const deleteFlashcard = useDeleteFlashcard();
  const correctFront = useSpellCheck();
  const correctBack = useSpellCheck();

  const frontSpeech = useSpeechRecognition(frontLang, (text) => setFront(text));
  const backSpeech = useSpeechRecognition(backLang, (text) => setBack(text));

  const handleSave = () => {
    if (!front.trim() || !back.trim()) return;
    updateFlashcard.mutate(
      {
        id: flashcard.id,
        front,
        back,
        frontLanguage: frontLang,
        backLanguage: backLang,
        chapterId,
      },
      { onSuccess: () => setIsEditing(false) }
    );
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    deleteFlashcard.mutate({ id: flashcard.id, chapterId });
    setShowDeleteDialog(false);
  };

  const handleCorrectFront = async () => {
    if (!front.trim()) return;
    const corrected = await correctFront.mutateAsync(front);
    setFront(corrected);
  };

  const handleCorrectBack = async () => {
    if (!back.trim()) return;
    const corrected = await correctBack.mutateAsync(back);
    setBack(corrected);
  };

  const handleDictateFront = () => {
    if (frontSpeech.isListening) {
      frontSpeech.stop();
    } else {
      frontSpeech.start();
    }
  };

  const handleDictateBack = () => {
    if (backSpeech.isListening) {
      backSpeech.stop();
    } else {
      backSpeech.start();
    }
  };

  if (isEditing) {
    return (
      <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-5 space-y-4">
        <p className="text-sm font-medium text-[var(--text-muted)]">Editando flashcard {String(index).padStart(2, '0')}</p>
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">Frente</label>
            <div className="flex items-center gap-2">
              <LanguageSelect value={frontLang} onChange={setFrontLang} />
              <button
                type="button"
                onClick={handleCorrectFront}
                disabled={correctFront.isPending || !front.trim()}
                className="text-[var(--text-muted)] hover:text-[var(--text)] disabled:opacity-50 transition-colors"
                aria-label="Corregir con IA"
                title="Corregir con IA"
              >
                <SparklesIcon />
              </button>
              {frontSpeech.isSupported && (
                <button
                  type="button"
                  onClick={handleDictateFront}
                  className={[
                    'transition-colors',
                    frontSpeech.isListening ? 'text-[var(--accent)] animate-pulse' : 'text-[var(--text-muted)] hover:text-[var(--text)]',
                  ].join(' ')}
                  aria-label={frontSpeech.isListening ? 'Detener dictado' : 'Dictar'}
                  title={frontSpeech.isListening ? 'Detener dictado' : 'Dictar'}
                >
                  <MicIcon />
                </button>
              )}
            </div>
          </div>
          <textarea
            value={front}
            onChange={(e) => setFront(e.target.value)}
            className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-4 py-2.5 text-[var(--text)] focus:outline-none focus:border-[var(--accent)] transition-colors"
            rows={2}
          />
        </div>
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">Reverso</label>
            <div className="flex items-center gap-2">
              <LanguageSelect value={backLang} onChange={setBackLang} />
              <button
                type="button"
                onClick={handleCorrectBack}
                disabled={correctBack.isPending || !back.trim()}
                className="text-[var(--text-muted)] hover:text-[var(--text)] disabled:opacity-50 transition-colors"
                aria-label="Corregir con IA"
                title="Corregir con IA"
              >
                <SparklesIcon />
              </button>
              {backSpeech.isSupported && (
                <button
                  type="button"
                  onClick={handleDictateBack}
                  className={[
                    'transition-colors',
                    backSpeech.isListening ? 'text-[var(--accent)] animate-pulse' : 'text-[var(--text-muted)] hover:text-[var(--text)]',
                  ].join(' ')}
                  aria-label={backSpeech.isListening ? 'Detener dictado' : 'Dictar'}
                  title={backSpeech.isListening ? 'Detener dictado' : 'Dictar'}
                >
                  <MicIcon />
                </button>
              )}
            </div>
          </div>
          <textarea
            value={back}
            onChange={(e) => setBack(e.target.value)}
            className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-4 py-2.5 text-[var(--text)] focus:outline-none focus:border-[var(--accent)] transition-colors"
            rows={2}
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-[var(--accent)] text-[var(--bg-elevated)] font-medium hover:bg-[var(--accent-light)] transition-colors"
          >
            Guardar
          </button>
          <button
            onClick={() => {
              setFront(flashcard.front);
              setBack(flashcard.back);
              setIsEditing(false);
            }}
            className="px-4 py-2 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--text)] transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-5 hover:border-[var(--accent)]/50 transition-colors duration-200">
      <div className="flex justify-between items-start mb-3">
        <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">
          Flashcard {String(index).padStart(2, '0')}
        </span>
        <span className="text-xs font-medium px-2 py-0.5 rounded bg-[var(--bg)] border border-[var(--border)] text-[var(--text-muted)]">
          {LEVEL_LABELS[flashcard.level as ReviewLevel]}
        </span>
      </div>

      <div className="grid md:grid-cols-2 gap-5 mb-4">
        <div>
          <span className="block text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide mb-1">Pregunta</span>
          <p className="text-[var(--text)] font-medium">{flashcard.front}</p>
        </div>
        <div>
          <span className="block text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide mb-1">Respuesta</span>
          <p className="text-[var(--text-muted)]">{flashcard.back}</p>
        </div>
      </div>

      <div className="flex gap-4 pt-3 border-t border-[var(--border)]">
        <button
          onClick={() => setIsEditing(true)}
          className="text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
        >
          Editar
        </button>
        <button
          onClick={handleDelete}
          className="text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
        >
          Eliminar
        </button>
      </div>
    </div>

    <ConfirmDialog
      isOpen={showDeleteDialog}
      title="Eliminar flashcard"
      message="¿Estás seguro? Esta acción no se puede deshacer."
      onConfirm={handleConfirmDelete}
      onCancel={() => setShowDeleteDialog(false)}
    />
  </>
  );
}
