import { createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
});

// Register router module for type-safe routing across the app
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

