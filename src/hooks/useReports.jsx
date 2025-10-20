import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Mock functions for demo
const mockReportsAPI = {
  getAll: async () => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return [
      {
        id: 1,
        name: 'Sales Report Q1 2024',
        description: 'Quarterly sales performance analysis',
        status: 'completed',
        generatedDate: '2024-03-31',
        size: '2.4 MB',
        type: 'sales'
      },
      {
        id: 2,
        name: 'Inventory Summary',
        description: 'Current inventory levels and trends',
        status: 'completed',
        generatedDate: '2024-03-28',
        size: '1.8 MB',
        type: 'inventory'
      }
    ];
  }
};

export const useReports = (filters) => {
  return useQuery({
    queryKey: ['reports', filters],
    queryFn: () => mockReportsAPI.getAll(filters),
  });
};
