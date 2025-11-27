import useSWR from 'swr';

interface SpendingData {
  month: string;
  amount: number;
  label: string;
}

interface SpendingStats {
  total: number;
  average: number;
  max: number;
  min: number;
}

interface SpendingStatsResponse {
  data: SpendingData[];
  stats: SpendingStats;
}

const fetcher = async (url: string) => {
  const token = localStorage.getItem('token');
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch spending stats');
  }
  
  return res.json();
};

export function useSpendingStats() {
  const { data, error, isLoading, mutate } = useSWR<SpendingStatsResponse>(
    '/api/profile/spending-stats',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false
    }
  );

  return {
    spendingData: data?.data || [],
    stats: data?.stats || { total: 0, average: 0, max: 0, min: 0 },
    isLoading,
    isError: error,
    mutate
  };
}
