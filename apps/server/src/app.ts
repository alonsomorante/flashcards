import { Hono } from "hono";
import { cors } from "hono/cors";
import decks from "./routes/decks";
import groups from "./routes/groups";
import cards from "./routes/cards";
import tags from "./routes/tags";
import study from "./routes/study";
import correct from "./routes/correct";
import extractText from "./routes/extract-text";
import generateFromText from "./routes/generate-from-text";

export const app = new Hono().basePath("/api");

app.use("*", cors({
  origin: ["http://localhost:5173", "http://localhost:3000"],
  credentials: true,
}));

app.route("/decks", decks);
app.route("/decks/:deckId/groups", groups);
app.route("/decks/:deckId/cards", cards);
app.route("/decks/:deckId/tags", tags);
app.route("/study/:deckId", study);
app.route("/correct", correct);
app.route("/decks/:deckId/extract-text", extractText);
app.route("/decks/:deckId/generate-from-text", generateFromText);

app.get("/health", (c) => c.json({ status: "ok" }));

export type AppType = typeof app;
