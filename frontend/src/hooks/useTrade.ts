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

export function useStats(from?: string | null, to?: string | null) {
  return {
    query: {
      queryKey: ['stats', from ?? 'all', to ?? 'all'],
      queryFn: async (): Promise<StatsData> => {
        const params: Record<string, string> = {};
        if (from) params['from'] = from;
        if (to) params['to'] = to;
        const { data } = await api.get<StatsData>('/stats', { params });
        return data;
      },
      refetchInterval: 10000,
    },
  };
}
