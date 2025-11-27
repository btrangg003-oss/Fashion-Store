import useSWR from 'swr';

interface Mission {
  id: string;
  title: string;
  description: string;
  points: number;
  progress: number;
  target: number;
  completed: boolean;
  icon: string;
}

interface MissionsSummary {
  completed: number;
  total: number;
  earnedPoints: number;
  possiblePoints: number;
}

interface DailyMissionsResponse {
  missions: Mission[];
  summary: MissionsSummary;
}

const fetcher = async (url: string) => {
  const token = localStorage.getItem('token');
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch daily missions');
  }
  
  return res.json();
};

export function useDailyMissions() {
  const { data, error, isLoading, mutate } = useSWR<DailyMissionsResponse>(
    '/api/profile/daily-missions',
    fetcher,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true
    }
  );

  return {
    missions: data?.missions || [],
    summary: data?.summary || { completed: 0, total: 0, earnedPoints: 0, possiblePoints: 0 },
    isLoading,
    isError: error,
    mutate
  };
}
