import { create } from 'zustand';

// Load from localStorage on init
const loadAuthFromStorage = () => {
  try {
    const stored = localStorage.getItem('auth-storage');
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        user: parsed.user || null,
        token: parsed.token || null,
        isAuthenticated: !!(parsed.user && parsed.token),
      };
    }
  } catch (error) {
    console.error('[AuthStore] Error loading from storage:', error);
    localStorage.removeItem('auth-storage');
  }
  return { user: null, token: null, isAuthenticated: false };
};

const initialAuth = loadAuthFromStorage();

const useAuthStore = create((set, get) => ({
  user: initialAuth.user,
  token: initialAuth.token,
  isAuthenticated: initialAuth.isAuthenticated,
  
  setAuth: (user, token) => {
    console.log('[AuthStore] setAuth called with:', { hasUser: !!user, hasToken: !!token, user, tokenLength: token?.length });
    
    if (!user || !token) {
      console.error('[AuthStore] setAuth called with invalid data:', { user, token });
      return;
    }
    
    const authData = { user, token, isAuthenticated: true };
    try {
      localStorage.setItem('auth-storage', JSON.stringify(authData));
      console.log('[AuthStore] Auth data saved to localStorage');
      
      // Verify it was saved
      const verify = localStorage.getItem('auth-storage');
      console.log('[AuthStore] Verification - saved:', verify ? 'Yes' : 'No');
      
      // Update state
      set(authData);
      
      // Verify state was updated
      const state = get();
      console.log('[AuthStore] State after setAuth:', { 
        isAuthenticated: state.isAuthenticated, 
        hasToken: !!state.token, 
        hasUser: !!state.user 
      });
    } catch (error) {
      console.error('[AuthStore] Error saving to storage:', error);
    }
  },
  
  logout: () => {
    localStorage.removeItem('auth-storage');
    set({ user: null, token: null, isAuthenticated: false });
  },
  
  updateUser: (user) => {
    set((state) => {
      const updatedUser = { ...state.user, ...user };
      try {
        localStorage.setItem('auth-storage', JSON.stringify({
          user: updatedUser,
          token: state.token,
          isAuthenticated: true,
        }));
      } catch (error) {
        console.error('[AuthStore] Error updating storage:', error);
      }
      return { user: updatedUser };
    });
  },
}));

export default useAuthStore;

