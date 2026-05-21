import { createRootRoute, createRoute, createRouter, Outlet, Link } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Layers } from "lucide-react";

import HomePage from "./pages/Home";
import NewDeckPage from "./pages/NewDeck";
import DeckDetailPage from "./pages/DeckDetail";
import DeckEditPage from "./pages/DeckEdit";
import StudyPage from "./pages/Study";
import GroupDetailPage from "./pages/GroupDetail";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-cream">
        <nav className="border-b border-border bg-paper/80 backdrop-blur-md sticky top-0 z-40">
          <div className="mx-auto flex h-16 max-w-5xl items-center px-5">
            <Link
              to="/"
              className="flex cursor-pointer items-center gap-2.5 text-lg font-semibold tracking-tight text-dark no-underline"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <Layers size={22} className="text-primary" />
              Flashcards
            </Link>
          </div>
        </nav>
        <main className="mx-auto max-w-5xl px-5 py-10">
          <Outlet />
        </main>
      </div>
    </QueryClientProvider>
  );
}

const rootRoute = createRootRoute({
  component: RootLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const newDeckRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/decks/new",
  component: NewDeckPage,
});

function DeckLayout() {
  return <Outlet />;
}

const deckRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/decks/$id",
  component: DeckLayout,
});

const deckIndexRoute = createRoute({
  getParentRoute: () => deckRoute,
  path: "/",
  component: DeckDetailPage,
});

const deckEditRoute = createRoute({
  getParentRoute: () => deckRoute,
  path: "/edit",
  component: DeckEditPage,
});

const studyRoute = createRoute({
  getParentRoute: () => deckRoute,
  path: "/study",
  component: StudyPage,
});

const groupRoute = createRoute({
  getParentRoute: () => deckRoute,
  path: "/groups/$groupId",
  component: GroupDetailPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  newDeckRoute,
  deckRoute.addChildren([deckIndexRoute, deckEditRoute, studyRoute, groupRoute]),
]);

export const router = createRouter({ routeTree, defaultPreload: "intent" });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
