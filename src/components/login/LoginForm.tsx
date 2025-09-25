import { useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabaseClient";

interface Errors {
  username: string;
  password: string;
}

export default function LoginForm() {
  const router = useRouter();

  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errors, setErrors] = useState<Errors>({ username: "", password: "" });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    let newErrors: Errors = { username: "", password: "" };
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (!trimmedUsername) {
      newErrors.username = "Username or Email is required";
    } else {
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedUsername);
      if (!isEmail && trimmedUsername.length < 6) {
        newErrors.username = "Username must be at least 6 characters";
      }
    }

    if (!trimmedPassword) newErrors.password = "Password is required";
    else if (trimmedPassword.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    setErrors(newErrors);
    if (newErrors.username || newErrors.password) return;

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedUsername);
    let emailToLogin = trimmedUsername;

    if (!isEmail) {
      const { data, error } = await supabase
        .from("users")
        .select("email")
        .eq("username", trimmedUsername)
        .single();

      if (error || !data?.email) {
        setErrors({ username: "Username not found", password: "" });
        return;
      }
      emailToLogin = data.email;
    }

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: emailToLogin,
      password: trimmedPassword,
    });

    if (authError) {
      setErrors({ username: "Login failed: " + authError.message, password: "" });
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-5 md:mb-[40px]">
        <label htmlFor="email" className="block mb-2 text-[15px] md:text-[16px] leading-[150%] text-gray-900">
          Username or Email
        </label>
        <input
          id="email"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your username or email"
          className="w-full md:w-[452px] h-[48px] rounded border border-gray-300 bg-white pt-3 pr-4 pb-3 pl-3 text-[16px] outline-none placeholder:text-gray-500 focus:border-green-700 transition"
        />
        <p className={`text-sm h-5 mt-1 ${errors.username ? "text-red-500 visible" : "invisible"}`}>
          {errors.username || "placeholder"}
        </p>
      </div>

      <div className="mb-5 md:mb-[40px]">
        <label htmlFor="password" className="block mb-2 text-[15px] md:text-[16px] leading-[150%] text-gray-900">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          className="w-full md:w-[452px] h-[48px] rounded border border-gray-300 bg-white pt-3 pr-4 pb-3 pl-3 text-[16px] outline-none placeholder:text-gray-500 focus:border-green-700 focus:ring-2 focus:ring-green-100 transition"
        />
        <p className={`text-sm h-5 mt-1 ${errors.password ? "text-red-500 visible" : "invisible"}`}>
          {errors.password || "placeholder"}
        </p>
      </div>

      <div className="flex flex-col">
        <button
          type="submit"
          className="w-full md:w-[452px] h-[48px] mb-4 md:mb-[16px] rounded bg-orange-600 font-inter text-white text-[16px] font-semibold leading-[16px] px-8 cursor-pointer transition hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-200"
        >
          Log In
        </button>

        <div className="flex items-center gap-2">
          <p className="font-inter text-[15px] md:text-[16px] leading-[150%] tracking-[-0.02em] text-gray-700">
            Don’t have an account yet?
          </p>
          <a href="/customer/register" className="font-semibold text-orange-500 text-[15px] md:text-[16px] hover:underline">
            Register
          </a>
        </div>
      </div>
    </form>
  );
}