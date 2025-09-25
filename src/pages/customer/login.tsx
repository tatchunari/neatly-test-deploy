import Head from "next/head";
import LoginForm from "@/components/login/LoginForm";

export default function CustomerLoginPage() {
  return (
    <>
      <Head>
        <title>Log In — Neatly</title>
      </Head>

      {/* MAIN */}
      <main>
        <div className="bg-bg max-w-[1440px] mx-auto flex flex-col md:flex-row">
          {/* ซ้าย: รูป */}
          <div className="w-full md:w-[708px] h-[240px] sm:h-[269px] md:h-[924px]">
            <img
              src="/images/login-bg.png"
              alt="Resort pool"
              className="w-full h-full object-cover"
            />
          </div>

          {/* ขวา: ฟอร์ม */}
          <div className="w-full md:w-[732px] md:h-[924px] px-4 py-8 md:px-0 md:pt-[150px] md:pb-[309px] md:pl-[120px] md:pr-[160px]">
            <div className="w-full md:w-[452px] md:h-[465px] flex flex-col">
              <div className="w-full md:w-[452px] md:h-[87px] mb-6 md:mb-[60px]">
                <h1 className="mb-4 md:mb-8 font-noto text-[40px] md:text-[68px] leading-[120%] md:leading-[125%] font-medium tracking-[-0.02em] text-green-800">
                  Log In
                </h1>
              </div>

              <div className="w-full md:w-[452px]">
                <LoginForm />
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

// import Head from "next/head";
// import { useState } from "react";
// import { useRouter } from "next/router";
// import { createClient } from "@supabase/supabase-js";
// import Navbar from "@/components/login/Navbar";

// interface Errors {
//   username: string;
//   password: string;
// }

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
// const supabase = createClient(supabaseUrl, supabaseAnonKey);

// export default function CustomerLoginPage() {
//   const router = useRouter();

//   const [username, setUsername] = useState<string>("");
//   const [password, setPassword] = useState<string>("");
//   const [errors, setErrors] = useState({ username: "", password: "" });

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();

//     let newErrors: Errors = { username: "", password: "" };

//     // Trim ช่องว่าง
//     const trimmedUsername = username.trim();
//     const trimmedPassword = password.trim();

//     // ตรวจสอบ username หรือ email
//     if (!trimmedUsername) {
//       newErrors.username = "Username or Email is required";
//     } else {
//       const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedUsername);
//       if (!isEmail && trimmedUsername.length < 6) {
//         newErrors.username = "Username must be at least 6 characters";
//       }
//     }

//     // ตรวจสอบ password
//     if (!trimmedPassword) {
//       newErrors.password = "Password is required";
//     } else if (trimmedPassword.length < 6) {
//       newErrors.password = "Password must be at least 6 characters";
//     }

//     // แสดง error ถ้ามี
//     setErrors(newErrors);
//     if (newErrors.username || newErrors.password) return;

//     // ตรวจสอบว่าเป็น email หรือ username
//     const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedUsername);
//     let emailToLogin = trimmedUsername;

//     if (!isEmail) {
//       const { data, error } = await supabase
//         .from("users")
//         .select("email")
//         .eq("username", trimmedUsername)
//         .single();

//       if (error || !data?.email) {
//         setErrors({ username: "Username not found", password: "" });
//         return;
//       }

//       emailToLogin = data.email;
//     }

//     const { data: authData, error: authError } =
//       await supabase.auth.signInWithPassword({
//         email: emailToLogin,
//         password: trimmedPassword,
//       });

//     if (authError) {
//       setErrors({
//         username: "Login failed: " + authError.message,
//         password: "",
//       });
//     } else {
//       router.push("/dashboard");
//     }
//   };

//   return (


    
//     <>
//       <Head>
//         <title>Log In — Neatly</title>
//       </Head>
//       <Navbar />

 
//       {/* MAIN */}
//       <main>
//         <div className="bg-bg max-w-[1440px] mx-auto flex flex-col md:flex-row">
//           {/* ซ้าย: รูป (มือถือสูง ~269px) */}
//           <div className="w-full md:w-[708px] h-[240px] sm:h-[269px] md:h-[924px]">
//             <img
//               src="/images/login-bg.png"
//               alt="Resort pool"
//               className="w-full h-full object-cover"
//             />
//           </div>

//           {/* ขวา: ฟอร์ม */}
//           <div className="w-full md:w-[732px] md:h-[924px] px-4 py-8 md:px-0 md:pt-[150px] md:pb-[309px] md:pl-[120px] md:pr-[160px]">
//             <div className="w-full md:w-[452px] md:h-[465px] flex flex-col">
//               <div className="w-full md:w-[452px] md:h-[87px] mb-6 md:mb-[60px]">
//                 <h1 className="mb-4 md:mb-8 font-noto text-[40px] md:text-[68px] leading-[120%] md:leading-[125%] font-medium tracking-[-0.02em] text-green-800">
//                   Log In
//                 </h1>
//               </div>

//               <div className="w-full md:w-[452px]">
//                 <form onSubmit={handleSubmit}>
//                   <div className="mb-5 md:mb-[40px]">
//                     <label
//                       htmlFor="email"
//                       className="block mb-2 text-[15px] md:text-[16px] leading-[150%] text-gray-900"
//                     >
//                       Username or Email
//                     </label>
//                     <input
//                       id="email"
//                       type="text"
//                       value={username}
//                       onChange={(e) => setUsername(e.target.value)}
//                       placeholder="Enter your username or email"
//                       className="w-full md:w-[452px] h-[48px] rounded border border-gray-300 bg-white pt-3 pr-4 pb-3 pl-3 text-[16px] outline-none placeholder:text-gray-500 focus:border-green-700 transition"
//                     />
//                     <p
//                       className={`text-sm h-5 mt-1 ${
//                         errors.username ? "text-red-500 visible" : "invisible"
//                       }`}
//                     >
//                       {errors.username || "placeholder"}
//                     </p>
//                   </div>

//                   <div className="mb-5 md:mb-[40px]">
//                     <label
//                       htmlFor="password"
//                       className="block mb-2 text-[15px] md:text-[16px] leading-[150%] text-gray-900"
//                     >
//                       Password
//                     </label>
//                     <input
//                       id="password"
//                       type="password"
//                       value={password}
//                       onChange={(e) => setPassword(e.target.value)}
//                       placeholder="Enter your password"
//                       className="w-full md:w-[452px] h-[48px] rounded border border-gray-300 bg-white pt-3 pr-4 pb-3 pl-3 text-[16px] outline-none placeholder:text-gray-500 focus:border-green-700 focus:ring-2 focus:ring-green-100 transition"
//                     />
//                     <p
//                       className={`text-sm h-5 mt-1 ${
//                         errors.password ? "text-red-500 visible" : "invisible"
//                       }`}
//                     >
//                       {errors.password || "placeholder"}
//                     </p>
//                   </div>

//                   <div className="flex flex-col">
//                     <button
//                       type="submit"
//                       className="w-full md:w-[452px] h-[48px] mb-4 md:mb-[16px] rounded bg-orange-600 font-inter text-white text-[16px] font-semibold leading-[16px] px-8 cursor-pointer transition hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-200"
//                     >
//                       Log In
//                     </button>

//                     {/* บรรทัด Register อยู่บรรทัดเดียวบนมือถือ */}
//                     <div className="flex items-center gap-2">
//                       <p className="font-inter text-[15px] md:text-[16px] leading-[150%] tracking-[-0.02em] text-gray-700">
//                         Don’t have an account yet?
//                       </p>
//                       <a
//                         href="/customer/register"
//                         className="font-semibold text-orange-500 text-[15px] md:text-[16px] hover:underline"
//                       >
//                         Register
//                       </a>
//                     </div>
//                   </div>
//                 </form>
//               </div>
//             </div>
//           </div>
//         </div>
//       </main>
//     </>
//   );
// }