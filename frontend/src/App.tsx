import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import { AppRoutes } from '@/routes/AppRoutes';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Reads are always safe to retry — worth being a bit more persistent
      // against the kind of transient upstream flakiness a slow DB provider
      // can produce, with quick backoff so it doesn't feel sluggish.
      retry: 2,
      retryDelay: (attempt) => 500 * 2 ** attempt,
      staleTime: 30 * 1000,
      refetchOnWindowFocus: false,
    },
    // Mutations deliberately do NOT auto-retry here: e.g. addToCart
    // increments quantity rather than setting it, so blindly retrying a
    // timed-out request could double it if the first attempt actually
    // succeeded server-side and only the response was lost. A failed
    // mutation surfaces a toast instead — safe to retry manually.
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: '#14110F',
                color: '#FBF8F2',
                fontSize: '13px',
                borderRadius: '999px',
                padding: '10px 18px',
              },
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
