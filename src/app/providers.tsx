"use client";

import AuthenticationProvider from "@/core/authentication/components/AuthenticationProvider";

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return <AuthenticationProvider>{children}</AuthenticationProvider>;
}
