import { Suspense } from "react";
import SignupScreen from "@/features/authentication/signup/components/SignupScreen";

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupScreen />
    </Suspense>
  );
}
