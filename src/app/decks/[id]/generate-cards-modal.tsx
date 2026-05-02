"use client";

import { useState } from "react";
import { Loader2, Trash2, Save, Sparkles, Wand2, FileText, ArrowRight } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/ui/image-upload";

interface GeneratedCard {
  front: string;
  back: string;
  notes?: string;
}

interface GenerateCardsModalProps {
  open: boolean;
  onClose: () => void;
  deckId: number;
  onCardsCreated: (cards: Array<{ id: number; front: string; back: string; notes?: string }>) => void;
}

export function GenerateCardsModal({
  open,
  onClose,
  deckId,
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
      const res = await fetch(`/api/decks/${deckId}/cards/batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cards: generatedCards }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to save cards");
      }
      
      onCardsCreated(data.cards);
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
      case "upload": return "Upload Book Pages";
      case "text": return "Review Extracted Text";
      case "review": return "Review Generated Cards";
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={getStepTitle()}
    >
      {/* Step 1: Upload Images */}
      {step === "upload" ? (
        <div className="space-y-4">
          <div className="rounded-lg bg-zinc-50 p-3 text-xs text-zinc-600 dark:bg-zinc-950 dark:text-zinc-400">
            <p className="flex items-center gap-1.5 font-medium">
              <Wand2 size={12} />
              AI-powered text extraction & card generation
            </p>
            <p className="mt-1">
              Upload up to 5 pages. We will extract the text, then generate high-quality flashcards.
            </p>
          </div>
          
          <ImageUpload images={images} onImagesChange={setImages} maxImages={5} />
          
          {error ? (
            <p className="text-sm text-red-500">{error}</p>
          ) : null}
          
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleExtractText}
              disabled={images.length === 0 || extracting}
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
            </Button>
          </div>
        </div>
      ) : null}

      {/* Step 2: Review Extracted Text */}
      {step === "text" ? (
        <div className="space-y-4">
          <div className="rounded-lg bg-zinc-50 p-3 text-xs text-zinc-600 dark:bg-zinc-950 dark:text-zinc-400">
            <p className="flex items-center gap-1.5 font-medium">
              <FileText size={12} />
              Text extracted successfully
            </p>
            <p className="mt-1">
              {extractedText.split(/\s+/).length} words · {extractedText.split("\n").length} lines
            </p>
          </div>
          
          <div className="max-h-[50vh] overflow-y-auto">
            <textarea
              value={extractedText}
              readOnly
              className="h-64 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs leading-relaxed text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
            />
          </div>
          
          {error ? (
            <p className="text-sm text-red-500">{error}</p>
          ) : null}
          
          <div className="flex justify-between gap-2">
            <Button variant="ghost" size="sm" onClick={() => setStep("upload")}>
              Back
            </Button>
            <Button
              size="sm"
              onClick={handleGenerateCards}
              disabled={!extractedText.trim() || generating}
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
            </Button>
          </div>
        </div>
      ) : null}

      {/* Step 3: Review Generated Cards */}
      {step === "review" ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {generatedCards.length} card{generatedCards.length !== 1 ? "s" : ""} generated
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep("text")}
              disabled={saving}
            >
              Back
            </Button>
          </div>
          
          <div className="max-h-[50vh] space-y-3 overflow-y-auto pr-1">
            {generatedCards.map((card, index) => (
              <div
                key={index}
                className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-400">
                    Card {index + 1}
                  </span>
                  <button
                    onClick={() => removeCard(index)}
                    className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-red-500 dark:hover:bg-zinc-900"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                      Front
                    </label>
                    <input
                      value={card.front}
                      onChange={(e) => updateCard(index, "front", e.target.value)}
                      className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-600 dark:focus:ring-zinc-600"
                    />
                  </div>
                  
                  <div>
                    <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                      Back
                    </label>
                    <input
                      value={card.back}
                      onChange={(e) => updateCard(index, "back", e.target.value)}
                      className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-600 dark:focus:ring-zinc-600"
                    />
                  </div>
                  
                  <div>
                    <label className="mb-1 block text-xs font-medium text-zinc-400 dark:text-zinc-500">
                      Notes
                    </label>
                    <input
                      value={card.notes ?? ""}
                      onChange={(e) => updateCard(index, "notes", e.target.value)}
                      placeholder="Optional context..."
                      className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-600 placeholder:text-zinc-300 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 dark:placeholder:text-zinc-700 dark:focus:border-zinc-600 dark:focus:ring-zinc-600"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {error ? (
            <p className="text-sm text-red-500">{error}</p>
          ) : null}
          
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={handleClose} disabled={saving}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={generatedCards.length === 0 || saving}>
              {saving ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={14} />
                  Save {generatedCards.length} Card{generatedCards.length !== 1 ? "s" : ""}
                </>
              )}
            </Button>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
