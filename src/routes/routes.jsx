// src/routes/routes.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import DashboardLayout from '../components/Layout/DashboardLayout';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Analytics from '../pages/Analytics/Analytics';
import SalesStatement from '../pages/Reports/SalesStatement/SalesStatement';
import DispatchStatement from '../pages/Reports/DispatchStatement/DispatchStatement';
import DispatchSummary from '../pages/Reports/DispatchSummary/DispatchSummary';
import MonthlyCumulativeRevaluation from '../pages/Reports/MonthlyCumulativeRevaluation/MonthlyCumulativeRevaluation.jsx';
import MonthlyCumulativeYPM from '../pages/Reports/MonthlyCumulativeYPM/MonthlyCumulativeYPM';
import MonthlyCumulativeYPMProductGroup from '../pages/Reports/MonthlyCumulativeYPMProductGroup/MonthlyCumulativeYPMProductGroup';

// Create wrapper components that pass darkMode to DashboardLayout
function DashboardWithLayout() {
  return (
    <DashboardLayout>
      <Dashboard />
    </DashboardLayout>
  );
}

function AnalyticsWithLayout() {
  return (
    <DashboardLayout>
      <Analytics />
    </DashboardLayout>
  );
}

function SalesStatementWithLayout() {
  return (
    <DashboardLayout>
      <SalesStatement />
    </DashboardLayout>
  );
}

function DispatchStatementWithLayout() {
  return (
    <DashboardLayout>
      <DispatchStatement />
    </DashboardLayout>
  );
}

function DispatchSummaryWithLayout() {
  return (
    <DashboardLayout>
      <DispatchSummary />
    </DashboardLayout>
  );
}

function MonthlyCumulativeRevaluationWithLayout() {
  return (
    <DashboardLayout>
      <MonthlyCumulativeRevaluation />
    </DashboardLayout>
  );
}

function MonthlyCumulativeYPMWithLayout() {
  return (
    <DashboardLayout>
      <MonthlyCumulativeYPM />
    </DashboardLayout>
  );
}

function MonthlyCumulativeYPMProductGroupWithLayout() {
  return (
    <DashboardLayout>
      <MonthlyCumulativeYPMProductGroup />
    </DashboardLayout>
  );
}

// 404 Component
function NotFoundPage() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">Page not found</p>
        <button 
          onClick={() => window.history.back()}
          className="bg-amber-500 text-white px-6 py-2 rounded-lg hover:bg-amber-600 transition-colors"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}

function ReportNotFoundPage() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">Report not found</p>
        <button 
          onClick={() => window.history.back()}
          className="bg-amber-500 text-white px-6 py-2 rounded-lg hover:bg-amber-600 transition-colors"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}

// Route configuration
export const routes = [
  // Public Routes
  {
    path: '/login',
    element: <Login />,
    isPublic: true,
    exact: true
  },
  
  // Redirects
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
    exact: true
  },

  // Protected Routes
  {
    path: '/dashboard',
    element: <DashboardWithLayout />,
    exact: true,
    name: 'Dashboard',
    showInNav: true,
    icon: 'dashboard'
  },
  
  {
    path: '/analytics',
    element: <AnalyticsWithLayout />,
    exact: true,
    name: 'Analytics',
    showInNav: true,
    icon: 'analytics'
  },
  
  // Report Routes
  {
    path: '/reports/sales-stmt',
    element: <SalesStatementWithLayout />,
    exact: true,
    name: 'Sales Statement',
    category: 'sales',
    description: 'Detailed sales performance and revenue analysis'
  },
  
  {
    path: '/reports/dispatch-stmt',
    element: <DispatchStatementWithLayout />,
    exact: true,
    name: 'Dispatch Statement',
    category: 'operations',
    description: 'Real-time product dispatch and delivery tracking'
  },
  
  {
    path: '/reports/dispatch-summ',
    element: <DispatchSummaryWithLayout />,
    exact: true,
    name: 'Dispatch Summary',
    category: 'operations',
    description: 'Comprehensive summary of dispatch operations'
  },
  
  {
    path: '/reports/mon-cumm-reval',
    element: <MonthlyCumulativeRevaluationWithLayout />,
    exact: true,
    name: 'Monthly Cumulative Revaluation',
    category: 'finance',
    description: 'Advanced financial revaluation and asset tracking'
  },
  
  {
    path: '/reports/mon-cumm-ypm',
    element: <MonthlyCumulativeYPMWithLayout />,
    exact: true,
    name: 'Monthly Cumulative YPM',
    category: 'performance',
    description: 'Yearly Performance Measurement analysis'
  },
  
  {
    path: '/reports/mon-cumm-ypm-prdgrp',
    element: <MonthlyCumulativeYPMProductGroupWithLayout />,
    exact: true,
    name: 'Monthly Cumulative YPM Product Group',
    category: 'performance',
    description: 'Granular product group performance measurement'
  },
  
  // Catch-all route for undefined report paths
  {
    path: '/reports/*',
    element: <ReportNotFoundPage />
  },
  
  // 404 Handler for all other routes
  {
    path: '*',
    element: <NotFoundPage />
  }
];

// Helper function to get navigation items
export const getNavigationItems = () => {
  return routes.filter(route => route.showInNav);
};

// Helper function to get report routes by category
export const getReportRoutesByCategory = () => {
  const reportRoutes = routes.filter(route => 
    route.path.startsWith('/reports/') && route.name
  );
  
  const categories = {};
  reportRoutes.forEach(route => {
    if (!categories[route.category]) {
      categories[route.category] = [];
    }
    categories[route.category].push(route);
  });
  
  return categories;
};

// Helper function to find route by path
export const findRouteByPath = (path) => {
  return routes.find(route => route.path === path);
};

export default routes;