import useSWR from 'swr';

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  category: string;
  featured?: boolean;
  trending?: boolean;
}

interface RecommendationsResponse {
  products: Product[];
  reason: string;
}

const fetcher = async (url: string) => {
  const token = localStorage.getItem('token');
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch recommendations');
  }
  
  return res.json();
};

export function useRecommendations() {
  const { data, error, isLoading, mutate } = useSWR<RecommendationsResponse>(
    '/api/profile/recommendations',
    fetcher,
    {
      revalidateOnFocus: false
    }
  );

  return {
    products: data?.products || [],
    reason: data?.reason || '',
    isLoading,
    isError: error,
    mutate
  };
}
