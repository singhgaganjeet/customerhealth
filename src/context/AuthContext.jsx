import { createContext, useContext } from 'react';
import { ClerkProvider, useUser, useAuth } from '@clerk/clerk-react';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const AdminCtx = createContext({
  isSignedIn: false,
  getToken: () => Promise.resolve(null),
});

// Bridges Clerk state into our context when Clerk is available
function ClerkBridge({ children }) {
  const { isSignedIn } = useUser();
  const { getToken } = useAuth();
  return (
    <AdminCtx.Provider value={{ isSignedIn: isSignedIn ?? false, getToken }}>
      {children}
    </AdminCtx.Provider>
  );
}

export function AuthProvider({ children }) {
  if (!PUBLISHABLE_KEY) {
    // No Clerk configured — app runs in public read-only mode
    return (
      <AdminCtx.Provider value={{ isSignedIn: false, getToken: () => Promise.resolve(null) }}>
        {children}
      </AdminCtx.Provider>
    );
  }
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <ClerkBridge>
        {children}
      </ClerkBridge>
    </ClerkProvider>
  );
}

export function useAdmin() {
  return useContext(AdminCtx);
}

export const CLERK_CONFIGURED = !!PUBLISHABLE_KEY;
