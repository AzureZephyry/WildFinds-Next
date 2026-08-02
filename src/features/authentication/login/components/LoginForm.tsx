"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { signInWithPassword } from "@/features/authentication/login/commands/signInWithPassword";

type AuthMessage = {
  type: "error" | "success";
  text: string;
};

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<AuthMessage | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    setIsSubmitting(true);

    try {
      await signInWithPassword({
        email,
        password,
      });
    } catch (error) {
      setIsSubmitting(false);

      if (error instanceof Error) {
        setMessage({ type: "error", text: error.message || "Unable to sign in. Please try again." });
      } else {
        setMessage({ type: "error", text: "Unable to sign in. Please try again." });
      }

      return;
    }

    setIsSubmitting(false);

    const requestedPath = searchParams.get("redirect");
    const redirectPath =
      requestedPath && requestedPath.startsWith("/") && !requestedPath.startsWith("//")
        ? requestedPath
        : "/";

    router.push(redirectPath);
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
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
          placeholder="Enter your password"
          required
        />
      </label>

      {message ? (
        <p className={`auth-message auth-message--${message.type}`}>{message.text}</p>
      ) : null}

      <button type="submit" className="auth-submit" disabled={isSubmitting}>
        {isSubmitting ? "Signing in..." : "Log in"}
      </button>
    </form>
  );
}
