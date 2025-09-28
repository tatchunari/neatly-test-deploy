// import Head from "next/head";
// import { useState } from "react";
// import { useRouter } from "next/router";
// import Image from "next/image";
// import { supabase } from "../../lib/supabaseClient";
// import Navbar from "../../components/Navbar";
// import loginLeft from "../../../image/login-left.png";

// interface Errors {
//   email: string;
//   password: string;
// }

// export default function AdminLoginPage() {
//   const router = useRouter();

//   const [email, setEmail] = useState<string>("");
//   const [password, setPassword] = useState<string>("");
//   const [errors, setErrors] = useState({ email: "", password: "" });
//   const [isLoading, setIsLoading] = useState(false);

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setIsLoading(true);

//     let newErrors: Errors = { email: "", password: "" };

//     // Trim whitespace
//     const trimmedEmail = email.trim();
//     const trimmedPassword = password.trim();

//     // Validate email
//     if (!trimmedEmail) {
//       newErrors.email = "กรุณากรอกอีเมล";
//     } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
//       newErrors.email = "กรุณากรอกอีเมลที่ถูกต้อง";
//     }

//     // Validate password
//     if (!trimmedPassword) {
//       newErrors.password = "กรุณากรอกรหัสผ่าน";
//     } else if (trimmedPassword.length < 6) {
//       newErrors.password = "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร";
//     }

//     // Show errors if any
//     setErrors(newErrors);
//     if (newErrors.email || newErrors.password) {
//       setIsLoading(false);
//       return;
//     }

//     try {
//       // Attempt admin login
//       const { data: authData, error: authError } =
//         await supabase.auth.signInWithPassword({
//           email: trimmedEmail,
//           password: trimmedPassword,
//         });

//       if (authError) {
//         setErrors({
//           email: "เข้าสู่ระบบล้มเหลว: " + authError.message,
//           password: "",
//         });
//       } else {
//         // Check if user is admin using profiles schema (id references auth.users.id)
//         const authUserId = authData.user?.id;

//         if (!authUserId) {
//           setErrors({
//             email: "เข้าสู่ระบบล้มเหลว: ข้อมูลผู้ใช้ไม่ครบถ้วน",
//             password: "",
//           });
//           await supabase.auth.signOut();
//           return;
//         }

//         const { data: profile, error: profileError } = await supabase
//           .from("profiles")
//           .select("role")
//           .eq("id", authUserId)
//           .single();

//         if (profileError || !profile?.role || profile.role !== "admin") {
//           setErrors({
//             email: "การเข้าถึงถูกปฏิเสธ ต้องมีสิทธิ์ผู้ดูแลระบบ",
//             password: "",
//           });
//           // Sign out the user if they're not admin
//           await supabase.auth.signOut();
//         } else {
//           // Redirect to admin dashboard
//           router.push("/admin");
//         }
//       }
//     } catch (error) {
//       setErrors({
//         email: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
//         password: "",
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <>
//       <Head>
//         <title>Admin Login — Neatly</title>
//       </Head>

//       <Navbar 
//         navItems={[
//           { label: "About Neatly", path: "/about" },
//           { label: "Service & Facilities", path: "/services" },
//           { label: "Rooms & Suits", path: "/rooms" },
//         ]}
//         loginLabel="Login"
//       />

//       {/* Main Content */}
//       <main className="bg-gray-100 min-h-screen pt-0">
//         <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row">
//           {/* Left: Background Image */}
//           <div className="w-full md:w-[40%] h-[300px] md:h-screen relative">
//             <Image
//               src={loginLeft}
//               alt="Resort pool"
//               fill
//               className="object-cover"
//               priority
//             />
//           </div>

//           {/* Right: Login Form */}
//           <div className="w-full md:w-[60%] bg-gray-100 flex items-center justify-center px-4 py-8 md:px-16 md:py-20">
//             <div className="w-full max-w-md">
//               <div className="mb-12">
//                 <h1 className="font-noto text-5xl md:text-6xl font-medium text-green-800 mb-2">
//                   Log In
//                 </h1>
//                 <p className="text-gray-600 text-sm">Admin Access</p>
//               </div>

//               <form onSubmit={handleSubmit} className="space-y-8">
//                 <div>
//                   <label
//                     htmlFor="email"
//                     className="block text-sm font-inter text-gray-700 mb-2"
//                   >
//                     Email
//                   </label>
//                   <input
//                     id="email"
//                     type="email"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     placeholder="Enter your email"
//                     className="w-full h-12 px-3 border border-gray-300 rounded bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-700 transition"
//                   />
//                   <p
//                     className={`text-sm h-5 mt-1 ${
//                       errors.email ? "text-red-500 visible" : "invisible"
//                     }`}
//                   >
//                     {errors.email || "placeholder"}
//                   </p>
//                 </div>

//                 <div>
//                   <label
//                     htmlFor="password"
//                     className="block text-sm font-inter text-gray-700 mb-2"
//                   >
//                     Password
//                   </label>
//                   <input
//                     id="password"
//                     type="password"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     placeholder="Enter your password"
//                     className="w-full h-12 px-3 border border-gray-300 rounded bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-700 transition"
//                   />
//                   <p
//                     className={`text-sm h-5 mt-1 ${
//                       errors.password ? "text-red-500 visible" : "invisible"
//                     }`}
//                   >
//                     {errors.password || "placeholder"}
//                   </p>
//                 </div>

//                 <div>
//                   <button
//                     type="submit"
//                     disabled={isLoading}
//                     className="w-full h-12 bg-orange-600 text-white font-inter font-semibold rounded hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
//                   >
//                     {isLoading ? "Signing in..." : "Log In"}
//                   </button>
//                 </div>

//                 <div className="text-center">
//                   <p className="text-sm text-gray-600">
//                     Don't have an account yet?{" "}
//                     <a
//                       href="/admin/register"
//                       className="text-orange-600 font-semibold hover:underline"
//                     >
//                       Register
//                     </a>
//                   </p>
//                 </div>
//               </form>
//             </div>
//           </div>
//         </div>
//       </main>
//     </>
//   );
// }

// export const getServerSideProps = async () => {
//   return {
//     redirect: {
//       destination: "/admin",
//       permanent: false,
//     },
//   };
// };
