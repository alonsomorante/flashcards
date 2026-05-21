import { useState } from "react";
import { Loader2, Trash2, Save, Sparkles, Wand2, FileText, ArrowRight, X } from "lucide-react";
import { ImageUpload } from "./ImageUpload";

interface GeneratedCard {
  front: string;
  back: string;
  notes?: string;
}

interface GroupOption {
  id: number;
  name: string;
}

interface GenerateCardsModalProps {
  open: boolean;
  onClose: () => void;
  deckId: string;
  groups: GroupOption[];
  onCardsCreated: () => void;
}

export function GenerateCardsModal({
  open,
  onClose,
  deckId,
  groups,
  onCardsCreated,
}: GenerateCardsModalProps) {
  const [images, setImages] = useState<string[]>([]);
  const [extractedText, setExtractedText] = useState("");
  const [generatedCards, setGeneratedCards] = useState<GeneratedCard[]>([]);
  const [extracting, setExtracting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"upload" | "text" | "review">("upload");
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(
    groups[0]?.id ?? null
  );

  const handleExtractText = async () => {
    if (images.length === 0) return;

    setExtracting(true);
    setError("");

    try {
      const res = await fetch(`/api/decks/${deckId}/extract-text`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to extract text");
      }

      setExtractedText(data.text);
      setStep("text");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to extract text");
    } finally {
      setExtracting(false);
    }
  };

  const handleGenerateCards = async () => {
    if (!extractedText.trim()) return;

    setGenerating(true);
    setError("");

    try {
      const res = await fetch(`/api/decks/${deckId}/generate-from-text`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: extractedText }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate cards");
      }

      setGeneratedCards(data.cards);
      setStep("review");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate cards");
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (generatedCards.length === 0) return;

    setSaving(true);
    setError("");

    try {
      const cardsWithGroup = generatedCards.map((card) => ({
        ...card,
        groupId: selectedGroupId,
      }));

      const res = await fetch(`/api/decks/${deckId}/cards/batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cards: cardsWithGroup }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save cards");
      }

      onCardsCreated();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save cards");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setImages([]);
    setExtractedText("");
    setGeneratedCards([]);
    setError("");
    setStep("upload");
    onClose();
  };

  const updateCard = (index: number, field: keyof GeneratedCard, value: string) => {
    setGeneratedCards((prev) =>
      prev.map((card, i) => (i === index ? { ...card, [field]: value } : card))
    );
  };

  const removeCard = (index: number) => {
    setGeneratedCards((prev) => prev.filter((_, i) => i !== index));
  };

  const getStepTitle = () => {
    switch (step) {
      case "upload":
        return "Upload Book Pages";
      case "text":
        return "Review Extracted Text";
      case "review":
        return "Review Generated Cards";
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[1.25rem] bg-paper p-6 shadow-2xl animate-scale-in max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2
            className="text-lg font-semibold text-ink"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {getStepTitle()}
          </h2>
          <button
            onClick={handleClose}
            className="rounded-lg p-1.5 text-ink-muted transition-colors hover:bg-cream-dark"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pr-1">
          {/* Step 1: Upload Images */}
          {step === "upload" ? (
            <div className="space-y-4">
              <div className="rounded-xl bg-cream-dark p-3 text-xs text-ink-muted">
                <p className="flex items-center gap-1.5 font-medium text-ink-light">
                  <Wand2 size={12} className="text-coral" />
                  AI-powered text extraction & card generation
                </p>
                <p className="mt-1">
                  Upload up to 5 pages. We will extract the text, then generate
                  high-quality flashcards.
                </p>
              </div>

              <ImageUpload
                images={images}
                onImagesChange={setImages}
                maxImages={5}
              />

              {error ? (
                <p className="text-sm text-rose">{error}</p>
              ) : null}

              <div className="flex justify-end gap-2">
                <button
                  onClick={handleClose}
                  className="inline-flex h-10 items-center rounded-xl px-4 text-sm font-medium text-ink-muted transition-colors hover:bg-cream-dark"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExtractText}
                  disabled={images.length === 0 || extracting}
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-coral px-4 text-sm font-medium text-white transition-all hover:bg-coral-dark disabled:opacity-50"
                >
                  {extracting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Extracting...
                    </>
                  ) : (
                    <>
                      <FileText size={14} />
                      Extract Text
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : null}

          {/* Step 2: Review Extracted Text */}
          {step === "text" ? (
            <div className="space-y-4">
              <div className="rounded-xl bg-cream-dark p-3 text-xs text-ink-muted">
                <p className="flex items-center gap-1.5 font-medium text-ink-light">
                  <FileText size={12} className="text-coral" />
                  Text extracted successfully
                </p>
                <p className="mt-1">
                  {extractedText.split(/\s+/).length} words ·{" "}
                  {extractedText.split("\n").length} lines
                </p>
              </div>

              <textarea
                value={extractedText}
                onChange={(e) => setExtractedText(e.target.value)}
                className="h-64 w-full resize-none rounded-xl border border-[#E8E2DA] bg-cream px-4 py-3 text-sm leading-relaxed text-ink placeholder:text-ink-muted/40 focus:border-coral/50 focus:outline-none focus:ring-2 focus:ring-coral/10"
              />

              {error ? (
                <p className="text-sm text-rose">{error}</p>
              ) : null}

              <div className="flex justify-between gap-2">
                <button
                  onClick={() => setStep("upload")}
                  className="inline-flex h-10 items-center rounded-xl px-4 text-sm font-medium text-ink-muted transition-colors hover:bg-cream-dark"
                >
                  Back
                </button>
                <button
                  onClick={handleGenerateCards}
                  disabled={!extractedText.trim() || generating}
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-coral px-4 text-sm font-medium text-white transition-all hover:bg-coral-dark disabled:opacity-50"
                >
                  {generating ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      Generate Cards
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : null}

          {/* Step 3: Review Generated Cards */}
          {step === "review" ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-ink-muted">
                  {generatedCards.length} card
                  {generatedCards.length !== 1 ? "s" : ""} generated
                </p>
                <button
                  onClick={() => setStep("text")}
                  disabled={saving}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-ink-muted transition-colors hover:bg-cream-dark disabled:opacity-50"
                >
                  Back
                </button>
              </div>

              {/* Group Selector */}
              {groups.length > 0 ? (
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-ink-muted">
                    Assign to group:
                  </label>
                  <select
                    value={selectedGroupId ?? ""}
                    onChange={(e) =>
                      setSelectedGroupId(Number(e.target.value))
                    }
                    className="h-8 rounded-lg border border-[#E8E2DA] bg-cream px-2 text-sm text-ink focus:border-coral/50 focus:outline-none focus:ring-2 focus:ring-coral/10"
                  >
                    {groups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <p className="text-xs text-amber-600">
                  No groups available. Create a group first.
                </p>
              )}

              <div className="space-y-3">
                {generatedCards.map((card, index) => (
                  <div
                    key={index}
                    className="rounded-[1.25rem] border border-[#E8E2DA] bg-cream p-4"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-medium text-ink-muted/60">
                        Card {index + 1}
                      </span>
                      <button
                        onClick={() => removeCard(index)}
                        className="rounded-lg p-1.5 text-ink-muted/40 transition-colors hover:bg-rose-light hover:text-rose"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-ink-muted">
                          Front
                        </label>
                        <input
                          value={card.front}
                          onChange={(e) =>
                            updateCard(index, "front", e.target.value)
                          }
                          className="h-10 w-full rounded-xl border border-[#E8E2DA] bg-paper px-3 text-sm text-ink focus:border-coral/50 focus:outline-none focus:ring-2 focus:ring-coral/10"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-medium text-ink-muted">
                          Back
                        </label>
                        <input
                          value={card.back}
                          onChange={(e) =>
                            updateCard(index, "back", e.target.value)
                          }
                          className="h-10 w-full rounded-xl border border-[#E8E2DA] bg-paper px-3 text-sm text-ink focus:border-coral/50 focus:outline-none focus:ring-2 focus:ring-coral/10"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-medium text-ink-muted/60">
                          Notes
                        </label>
                        <input
                          value={card.notes ?? ""}
                          onChange={(e) =>
                            updateCard(index, "notes", e.target.value)
                          }
                          placeholder="Optional context..."
                          className="h-10 w-full rounded-xl border border-[#E8E2DA] bg-paper px-3 text-sm text-ink placeholder:text-ink-muted/30 focus:border-coral/50 focus:outline-none focus:ring-2 focus:ring-coral/10"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {error ? (
                <p className="text-sm text-rose">{error}</p>
              ) : null}

              <div className="flex justify-end gap-2">
                <button
                  onClick={handleClose}
                  disabled={saving}
                  className="inline-flex h-10 items-center rounded-xl px-4 text-sm font-medium text-ink-muted transition-colors hover:bg-cream-dark disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={generatedCards.length === 0 || saving}
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-coral px-4 text-sm font-medium text-white transition-all hover:bg-coral-dark disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={14} />
                      Save {generatedCards.length} Card
                      {generatedCards.length !== 1 ? "s" : ""}
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
