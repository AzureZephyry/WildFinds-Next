import Link from "next/link";
import LoginForm from "@/features/authentication/login/components/LoginForm";

export default function LoginScreen() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__header">
          <p className="eyebrow">Access your account</p>
          <h2>Welcome back</h2>
          <p>Sign in to continue using WildFinds.</p>
        </div>

        <LoginForm />

        <p className="auth-footer">
          New here? <Link href="/signup">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
