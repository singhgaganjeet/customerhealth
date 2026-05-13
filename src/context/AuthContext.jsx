import { createContext, useContext, useState, useEffect } from 'react';
import { ClerkProvider, useUser, useAuth, useClerk } from '@clerk/clerk-react';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const ADMIN_EMAIL     = import.meta.env.VITE_ADMIN_EMAIL;

const AdminCtx = createContext({
  isSignedIn: false,
  getToken: () => Promise.resolve(null),
});

function ClerkBridge({ children }) {
  const { isSignedIn, isLoaded, user } = useUser();
  const { getToken } = useAuth();
  const { signOut } = useClerk();
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    if (!ADMIN_EMAIL) return;
    const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase();
    if (email && email !== ADMIN_EMAIL.toLowerCase()) {
      signOut();
      setDenied(true);
    }
  }, [isLoaded, isSignedIn, user]);

  const isAdmin = isSignedIn && (
    !ADMIN_EMAIL ||
    user?.primaryEmailAddress?.emailAddress?.toLowerCase() === ADMIN_EMAIL.toLowerCase()
  );

  return (
    <>
      <AdminCtx.Provider value={{ isSignedIn: isAdmin ?? false, getToken }}>
        {children}
      </AdminCtx.Provider>

      {denied && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m2-5V7m0 0V5m0 2h2M12 7H10M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" />
              </svg>
            </div>
            <h2 className="text-base font-semibold text-slate-800 mb-2">Access Restricted</h2>
            <p className="text-sm text-slate-500 mb-6">
              This dashboard has a single admin account. Only the authorized administrator can sign in.
            </p>
            <button
              onClick={() => setDenied(false)}
              className="text-sm bg-slate-800 text-white px-5 py-2 rounded-lg hover:bg-slate-700 transition-colors font-medium"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export function AuthProvider({ children }) {
  if (!PUBLISHABLE_KEY) {
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
