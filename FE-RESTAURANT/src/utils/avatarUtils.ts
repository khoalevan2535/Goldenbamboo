// Utility functions for avatar management

export interface UserInfo {
  accountId: string;
  name: string;
  email: string;
  roles: string[];
  avatarUrl: string;
}

/**
 * Load avatar URL from localStorage with fallback strategy
 * Priority: userInfo > individual avatar > API avatar
 */
export const loadAvatarFromStorage = (accountId: string): string | null => {
  try {
    // 1. Try to get from userInfo first
    const userInfoKey = `userInfo_${accountId || 'default'}`;
    const storedUserInfo = localStorage.getItem(userInfoKey);
    if (storedUserInfo) {
      const userInfo: UserInfo = JSON.parse(storedUserInfo);
      if (userInfo.avatarUrl) {
        console.log('AvatarUtils: Found avatar in userInfo:', userInfo.avatarUrl);
        return userInfo.avatarUrl;
      }
    }

    // 2. Try to get from individual avatar key
    const avatarKey = `userAvatar_${accountId || 'default'}`;
    const storedAvatar = localStorage.getItem(avatarKey);
    if (storedAvatar) {
      return storedAvatar;
    }

    return null;
  } catch (error) {
    console.error('AvatarUtils: Error loading avatar from storage:', error);
    return null;
  }
};

/**
 * Save avatar URL to localStorage
 */
export const saveAvatarToStorage = (accountId: string, avatarUrl: string): void => {
  try {
    // Save to individual avatar key
    const avatarKey = `userAvatar_${accountId || 'default'}`;
    localStorage.setItem(avatarKey, avatarUrl);
    // Also update userInfo if it exists
    const userInfoKey = `userInfo_${accountId || 'default'}`;
    const storedUserInfo = localStorage.getItem(userInfoKey);
    if (storedUserInfo) {
      const userInfo: UserInfo = JSON.parse(storedUserInfo);
      userInfo.avatarUrl = avatarUrl;
      localStorage.setItem(userInfoKey, JSON.stringify(userInfo));
    }
  } catch (error) {
    console.error('AvatarUtils: Error saving avatar to storage:', error);
  }
};

/**
 * Save user info to localStorage
 */
export const saveUserInfoToStorage = (userInfo: UserInfo): void => {
  try {
    const userInfoKey = `userInfo_${userInfo.accountId || 'default'}`;
    localStorage.setItem(userInfoKey, JSON.stringify(userInfo));
    // User info saved to storage
  } catch (error) {
    console.error('AvatarUtils: Error saving user info to storage:', error);
  }
};

/**
 * Improve Google avatar URL for better quality
 */
export const improveGoogleAvatarUrl = (avatarUrl: string): string => {
  if (avatarUrl.includes('googleusercontent.com')) {
    // Change from s96-c to s400-c for larger avatar
    let improvedUrl = avatarUrl.replace(/=s\d+-c/, '=s400-c');
    // Add timestamp to avoid cache
    improvedUrl += `&t=${Date.now()}`;
    console.log('AvatarUtils: Improved Google avatar URL:', improvedUrl);
    return improvedUrl;
  }
  return avatarUrl;
};

/**
 * Test if avatar URL is valid by loading the image
 */
export const testAvatarUrl = (avatarUrl: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const testImg = new Image();
    testImg.onload = () => {
      console.log('AvatarUtils: Avatar URL is valid:', avatarUrl);
      resolve(true);
    };
    testImg.onerror = () => {
      console.error('AvatarUtils: Avatar URL is invalid:', avatarUrl);
      resolve(false);
    };
    testImg.src = avatarUrl;
  });
};

/**
 * Remove invalid avatar from localStorage
 */
export const removeInvalidAvatar = (accountId: string): void => {
  try {
    const avatarKey = `userAvatar_${accountId || 'default'}`;
    const userInfoKey = `userInfo_${accountId || 'default'}`;
    
    localStorage.removeItem(avatarKey);
    console.log('AvatarUtils: Removed invalid avatar from individual key:', avatarKey);
    
    const storedUserInfo = localStorage.getItem(userInfoKey);
    if (storedUserInfo) {
      const userInfo: UserInfo = JSON.parse(storedUserInfo);
      delete userInfo.avatarUrl;
      localStorage.setItem(userInfoKey, JSON.stringify(userInfo));
      console.log('AvatarUtils: Removed invalid avatar from userInfo:', userInfoKey);
    }
  } catch (error) {
    console.error('AvatarUtils: Error removing invalid avatar:', error);
  }
};

/**
 * Load user info from localStorage
 */
export const loadUserInfoFromStorage = (accountId: string): UserInfo | null => {
  try {
    const userInfoKey = `userInfo_${accountId || 'default'}`;
    const storedUserInfo = localStorage.getItem(userInfoKey);
    if (storedUserInfo) {
      const userInfo: UserInfo = JSON.parse(storedUserInfo);
      console.log('AvatarUtils: Loaded user info from storage:', userInfo);
      return userInfo;
    }
    console.log('AvatarUtils: No user info found in storage');
    return null;
  } catch (error) {
    console.error('AvatarUtils: Error loading user info from storage:', error);
    return null;
  }
};

/**
 * Get stored user roles for redirection
 */
export const getStoredUserRoles = (accountId: string): string[] => {
  const userInfo = loadUserInfoFromStorage(accountId);
  return userInfo?.roles || [];
};
