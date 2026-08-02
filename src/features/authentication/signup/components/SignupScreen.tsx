import Link from "next/link";
import SignupForm from "@/features/authentication/signup/components/SignupForm";

export default function SignupScreen() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__header">
          <p className="eyebrow">Create your account</p>
          <h2>Join WildFinds</h2>
          <p>Sign up to report items and help reunite belongings.</p>
        </div>

        <SignupForm />

        <p className="auth-footer">
          Already have an account? <Link href="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
