'use client';

import React from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';

interface Props {
  children: React.ReactNode;
}

export function GoogleAuthProviderWrapper({ children }: Props) {
  // Read client ID from environment or fallback placeholder
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '1234567890-mockclientid.apps.googleusercontent.com';

  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  );
}
