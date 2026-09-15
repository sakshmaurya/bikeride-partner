const API_HOST = process.env.EXPO_PUBLIC_API_IP;

export const API_BASE_URL = API_HOST?.startsWith('http')
  ? `${API_HOST}/api`
  : `https://${API_HOST}/api`;
