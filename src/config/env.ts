export const config = {
  apiBaseUrl:
    import.meta.env.VITE_API_BASE_URL ||
    'https://berestaurantappformentee-production.up.railway.app',
} as const;
