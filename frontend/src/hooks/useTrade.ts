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

export interface StatsData {
  total_trades: number;
  today_trades: number;
  total_net_profit: number;
  total_charges: number;
  segment_stats: Record<string, { count: number; profit: number }>;
  profit_curve: { date: string; profit: number }[];
  charge_breakdown: Record<string, number>;
}

export function useStats() {
  return {
    query: {
      queryKey: ['stats'],
      queryFn: async (): Promise<StatsData> => {
        const { data } = await api.get<StatsData>('/stats');
        return data;
      },
      refetchInterval: 10000,
    },
  };
}
