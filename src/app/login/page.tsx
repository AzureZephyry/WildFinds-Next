import { Suspense } from "react";
import LoginScreen from "@/features/authentication/login/components/LoginScreen";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginScreen />
    </Suspense>
  );
}
