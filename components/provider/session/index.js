'use client';

import { SessionProvider } from "next-auth/react";

const SSProvider = ({ children, session }) => (
  <SessionProvider session={session}>
    {children}
  </SessionProvider>
)

export default SSProvider;