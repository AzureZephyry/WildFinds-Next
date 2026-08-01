"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { signUpAccount } from "@/features/authentication/signup/commands/signUpAccount";

type AuthMessage = {
  type: "error" | "success";
  text: string;
};

export default function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<AuthMessage | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      setMessage({ type: "error", text: "Please fill in all fields." });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage({ type: "error", text: "Please enter a valid email address." });
      return;
    }

    if (password.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters long." });
      return;
    }

    if (password !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match." });
      return;
    }

    setIsSubmitting(true);

    try {
      await signUpAccount({
        fullName,
        email,
        password,
      });
    } catch (error) {
      setIsSubmitting(false);

      if (error instanceof Error) {
        setMessage({ type: "error", text: error.message || "Unable to create your account." });
      } else {
        setMessage({ type: "error", text: "Unable to create your account." });
      }

      return;
    }

    setIsSubmitting(false);

    setMessage({
      type: "success",
      text: "Account created. Please check your email to confirm your address if email confirmation is enabled.",
    });

    setFullName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");

    const client = (await import("@/infrastructure/supabase/clients/browserSupabaseClient")).supabase;

    if (client) {
      const {
        data: { session },
      } = await client.auth.getSession();

      if (session) {
        const requestedPath = searchParams.get("redirect");
        const redirectPath =
          requestedPath && requestedPath.startsWith("/") && !requestedPath.startsWith("//")
            ? requestedPath
            : "/";

        router.push(redirectPath);
      }
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <label className="auth-field">
        <span>Full Name</span>
        <input
          type="text"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          placeholder="Your full name"
          required
        />
      </label>

      <label className="auth-field">
        <span>Email</span>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          required
        />
      </label>

      <label className="auth-field">
        <span>Password</span>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Create a password"
          required
        />
      </label>

      <label className="auth-field">
        <span>Confirm Password</span>
        <input
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          placeholder="Confirm your password"
          required
        />
      </label>

      {message ? (
        <p className={`auth-message auth-message--${message.type}`}>{message.text}</p>
      ) : null}

      <button type="submit" className="auth-submit" disabled={isSubmitting}>
        {isSubmitting ? "Creating account..." : "Sign up"}
      </button>
    </form>
  );
}
