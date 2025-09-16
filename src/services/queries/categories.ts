import { useQuery } from '@tanstack/react-query';
import { categoriesApi } from '@/services/api/categories';

export function useCategoriesQuery() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getCategories,
    staleTime: 10 * 60 * 1000, // 10 minutes - categories don't change often
    retry: false, // Don't retry on failure to prevent loops
  });
}
