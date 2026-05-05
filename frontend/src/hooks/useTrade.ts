import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import type { CalculationRequest, Trade } from '../types';

export function useCalculate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CalculationRequest) => {
      const response = await api.post<Trade>('/calculate', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['history'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useHistory() {
  return {
    query: {
      queryKey: ['history'],
      queryFn: async () => {
        const response = await api.get<Trade[]>('/history');
        return response.data;
      },
    },
  };
}

export function useDeleteTrade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/history/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['history'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useStats() {
  return {
    query: {
      queryKey: ['stats'],
      queryFn: async () => {
        const { data } = await api.get('/stats');
        return data as { total_trades: number, today_trades: number };
      },
      refetchInterval: 10000,
    }
  };
}
