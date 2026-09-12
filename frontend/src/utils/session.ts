import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_ID_KEY = '@bikeride_user_id';
const USER_DATA_KEY = '@bikeride_user_data';
const AUTH_TOKEN_KEY = '@bikeride_auth_token';

export const setCurrentUserId = async (userId: number) => {
  try {
    await AsyncStorage.setItem(USER_ID_KEY, userId.toString());
  } catch (error) {
    console.error('Error saving user ID:', error);
  }
};

export const setAuthToken = async (token: string | null) => {
  try {
    if (!token) {
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      return;
    }

    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
  } catch (error) {
    console.error('Error saving auth token:', error);
  }
};

export const getAuthToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

export const getCurrentUserId = async (): Promise<number | null> => {
  try {
    const userIdStr = await AsyncStorage.getItem(USER_ID_KEY);
    return userIdStr ? parseInt(userIdStr, 10) : null;
  } catch (error) {
    console.error('Error getting user ID:', error);
    return null;
  }
};

export const clearCurrentUserId = async () => {
  try {
    await AsyncStorage.removeItem(USER_ID_KEY);
    await AsyncStorage.removeItem(USER_DATA_KEY);
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('Error clearing user ID:', error);
  }
};

export const setUserData = async (userData: any) => {
  try {
    await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
  } catch (error) {
    console.error('Error saving user data:', error);
  }
};

export const getUserData = async (): Promise<any> => {
  try {
    const userDataStr = await AsyncStorage.getItem(USER_DATA_KEY);
    return userDataStr ? JSON.parse(userDataStr) : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};
