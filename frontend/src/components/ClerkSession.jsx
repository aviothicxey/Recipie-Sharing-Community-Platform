import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/react';
import App from '../App';
import { getClerkSession } from '../services/authApi';

export default function ClerkSession() {
  const { getToken, isSignedIn, sessionId, signOut } = useAuth();
  const [session, setSession] = useState(null);

  useEffect(() => {
    if (!isSignedIn) return;
    const controller = new AbortController();
    getClerkSession(getToken, controller.signal)
      .then((user) => {
        if (!controller.signal.aborted) setSession({ id: sessionId, auth: { user, token: getToken } });
      })
      .catch((error) => {
        if (!controller.signal.aborted) setSession({ id: sessionId, error: error.message });
      });
    return () => controller.abort();
  }, [getToken, isSignedIn, sessionId]);

  const activeSession = isSignedIn && session?.id === sessionId ? session : null;

  return (
    <App
      googleEnabled
      clerkSignedIn={isSignedIn}
      clerkAuth={activeSession?.auth}
      clerkError={activeSession?.error}
      clerkSignOut={signOut}
      onClerkProfileUpdated={(user) => setSession((current) => ({ ...current, auth: { ...current.auth, user } }))}
    />
  );
}
