import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import ErrorBoundary from "./components/UI/ErrorBoundary";
import { routes } from "./routes/routes";
import { setupApiInterceptor } from "./services/apiInterceptor";

// Create a client with enhanced configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors (especially 401/403)
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: (failureCount, error) => {
        // Don't retry on auth errors
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          return false;
        }
        return failureCount < 1;
      },
    },
  },
});

// Setup API interceptor
setupApiInterceptor();

// Protected Route Component
function ProtectedRoute({ children }) {
  const { user, loading, isAuthenticated } = useAuth();
  
  // Check for API session expiry
  const apiSessionExpired = localStorage.getItem('apiSessionExpired') === 'true';
  const sessionExpiry = localStorage.getItem('sessionExpiry');
  const isSessionExpired = sessionExpiry && Date.now() > parseInt(sessionExpiry);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-white dark:from-gray-900 dark:to-amber-900/20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-amber-700 dark:text-amber-300 font-medium">Loading your session...</p>
        </div>
      </div>
    );
  }
  
  // Redirect to login if session expired
  if (apiSessionExpired || isSessionExpired || !isAuthenticated) {
    // Clear the expired flag
    localStorage.removeItem('apiSessionExpired');
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

function PublicRoute({ children }) {
  const { user, loading, isAuthenticated } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-white dark:from-gray-900 dark:to-amber-900/20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-amber-700 dark:text-amber-300 font-medium">Loading...</p>
        </div>
      </div>
    );
  }
  
  // If user is authenticated and tries to access public routes, redirect to dashboard
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
}

// Error Fallback Component
function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-white dark:from-gray-900 dark:to-amber-900/20">
      <div className="max-w-md w-full text-center p-6">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Something went wrong</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">We encountered an unexpected error. Please try refreshing the page.</p>
        <details className="text-left mb-4">
          <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400">Error details</summary>
          <pre className="mt-2 text-xs text-gray-400 dark:text-gray-500 overflow-auto">{error.message}</pre>
        </details>
        <button
          onClick={resetErrorBoundary}
          className="bg-amber-500 text-white px-6 py-2 rounded-lg hover:bg-amber-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

// Route Renderer Component
function RouteRenderer() {
  return (
    <Routes>
      {routes.map((route, index) => {
        if (route.isPublic) {
          return (
            <Route
              key={index}
              path={route.path}
              element={
                <PublicRoute>
                  {route.element}
                </PublicRoute>
              }
              exact={route.exact}
            />
          );
        } else {
          return (
            <Route
              key={index}
              path={route.path}
              element={
                <ProtectedRoute>
                  {route.element}
                </ProtectedRoute>
              }
              exact={route.exact}
            />
          );
        }
      })}
    </Routes>
  );
}

function AppContent() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Router>
        <RouteRenderer />
      </Router>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;