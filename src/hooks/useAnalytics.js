import { useQuery } from '@tanstack/react-query';
import { analyticsAPI } from '../services/api';

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: () => analyticsAPI.getDashboardStats(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useReportMetrics = () => {
  return useQuery({
    queryKey: ['analytics', 'metrics'],
    queryFn: () => analyticsAPI.getReportMetrics(),
  });
};