const API_BASE = ""; // Uses Vite proxy

export interface DeckData {
  id: number;
  name: string;
  description: string | null;
  groups: Array<{
    id: number;
    name: string;
    displayOrder: number;
    cards: Array<{ id: number; front: string; back: string; notes?: string | null }>;
    dueCount: number;
  }>;
  ungroupedCards: Array<{ id: number; front: string; back: string; notes?: string | null }>;
  totalDue: number;
}

export async function fetchDecks() {
  const res = await fetch(`${API_BASE}/api/decks`);
  if (!res.ok) throw new Error("Failed to fetch decks");
  return res.json();
}

export async function createDeck(data: { name: string; description?: string }) {
  const res = await fetch(`${API_BASE}/api/decks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create deck");
  return res.json();
}

export async function fetchDeck(id: string) {
  const res = await fetch(`${API_BASE}/api/decks/${id}`);
  if (!res.ok) throw new Error("Failed to fetch deck");
  return res.json();
}

export async function updateDeck(id: string, data: { name?: string; description?: string }) {
  const res = await fetch(`${API_BASE}/api/decks/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update deck");
  return res.json();
}

export async function deleteDeck(id: string) {
  const res = await fetch(`${API_BASE}/api/decks/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete deck");
  return res.json();
}

export async function fetchStudyCards(deckId: string, groupId?: string) {
  const url = new URL(`${API_BASE}/api/study/${deckId}`, window.location.origin);
  if (groupId) url.searchParams.set("groupId", groupId);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Failed to fetch study cards");
  return res.json();
}

export async function rateCard(deckId: string, cardId: number, quality: number) {
  const res = await fetch(`${API_BASE}/api/study/${deckId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cardId, quality }),
  });
  if (!res.ok) throw new Error("Failed to save rating");
  return res.json();
}

export async function createGroup(deckId: string, data: { name: string }) {
  const res = await fetch(`${API_BASE}/api/decks/${deckId}/groups`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create group");
  return res.json();
}

export async function deleteGroup(deckId: string, groupId: string) {
  const res = await fetch(`${API_BASE}/api/decks/${deckId}/groups/${groupId}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete group");
  return res.json();
}

export async function createCard(deckId: string, data: { front: string; back: string; notes?: string; groupId: number }) {
  const res = await fetch(`${API_BASE}/api/decks/${deckId}/cards`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create card");
  return res.json();
}

export async function updateCard(deckId: string, cardId: number, data: { front?: string; back?: string; notes?: string }) {
  const res = await fetch(`${API_BASE}/api/decks/${deckId}/cards/${cardId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update card");
  return res.json();
}

export async function deleteCard(deckId: string, cardId: number) {
  const res = await fetch(`${API_BASE}/api/decks/${deckId}/cards/${cardId}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete card");
  return res.json();
}
