import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import DashboardLayout from "./components/Layout/DashboardLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import LoadingSpinner from "./components/UI/LoadingSpinner";
import ErrorBoundary from "./components/UI/ErrorBoundary";

// Create a client with enhanced configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Enhanced Protected Route Component
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  if (!user) {
    // Redirect to login with return url
    return <Navigate to={`/login?redirect=${encodeURIComponent(window.location.pathname)}`} replace />;
  }
  
  return children;
}

// Enhanced Public Route Component
function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  // Redirect authenticated users away from public routes
  if (user) {
    const urlParams = new URLSearchParams(window.location.search);
    const redirectTo = urlParams.get("redirect") || "/";
    return <Navigate to={redirectTo} replace />;
  }
  
  return children;
}

// Error Fallback Component
function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center p-6">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
        <p className="text-gray-600 mb-4">We encountered an unexpected error. Please try refreshing the page.</p>
        <details className="text-left mb-4">
          <summary className="cursor-pointer text-sm text-gray-500">Error details</summary>
          <pre className="mt-2 text-xs text-gray-400 overflow-auto">{error.message}</pre>
        </details>
        <button
          onClick={resetErrorBoundary}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

function AppContent() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          
          <Route
            path="/unauthorized"
            element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">Unauthorized Access</h1>
                  <p className="text-gray-600">You don't have permission to access this page.</p>
                </div>
              </div>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/reports" element={<Dashboard />} />
                    
                    {/* 404 Handler for protected routes */}
                    <Route
                      path="*"
                      element={
                        <div className="flex-1 flex items-center justify-center">
                          <div className="text-center">
                            <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                            <p className="text-gray-600 mb-4">Page not found</p>
                            <Navigate to="/" replace />
                          </div>
                        </div>
                      }
                    />
                  </Routes>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Global 404 Handler */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                  <p className="text-gray-600 mb-4">The page you're looking for doesn't exist.</p>
                  <Navigate to="/" replace />
                </div>
              </div>
            }
          />
        </Routes>
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