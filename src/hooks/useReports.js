import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportsAPI } from '../services/api';

export const useReports = (filters) => {
  return useQuery({
    queryKey: ['reports', filters],
    queryFn: () => reportsAPI.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    keepPreviousData: true,
  });
};

export const useReport = (id) => {
  return useQuery({
    queryKey: ['report', id],
    queryFn: () => reportsAPI.getById(id),
    enabled: !!id,
  });
};

export const useGenerateReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: reportsAPI.generate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
};

export const useDownloadReport = () => {
  return useMutation({
    mutationFn: reportsAPI.download,
    onSuccess: (data, reportId) => {
      // Create download link
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report-${reportId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    },
  });
};