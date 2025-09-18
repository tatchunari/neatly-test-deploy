import Head from "next/head";
import { useState } from "react";

export default function CustomerLoginPage() {
  interface Errors {
    username: string;
    password: string;
  }

  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errors, setErrors] = useState({ username: "", password: "" });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    let newErrors: Errors = { username: "", password: "" };

    // ตรวจสอบเงื่อนไข
    if (username.length < 6) {
      newErrors.username = "Username must be at least 6 characters";
    }
    if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (!username || !password) {
      if (!username) newErrors.username = "Username is required";
      if (!password) newErrors.password = "Password is required";
    }

    // ถ้าไม่มีข้อผิดพลาดให้ทำการล็อกอิน
    if (!newErrors.username && !newErrors.password) {
      // สามารถเพิ่มการส่งข้อมูลไปที่ backend ที่นี่
      console.log("Logging in with", username, password);
    }

    setErrors(newErrors);
  };

  return (
    <>
      <Head>
        <title>Log In — Neatly</title>
      </Head>

      <nav>
        <div className="bg-white max-w-[1440px] mx-auto border border-gray-300 flex justify-between items-center h-12 md:h-[100px] px-4 md:px-[160px]">
          <div className="flex justify-between gap-[48px] w-auto h-full md:w-[659px] md:h-[100px]">
            <div className="flex items-center justify-center">
              <div className="flex items-center w-auto md:w-[167px] h-[45px]">
                <img
                  src={"/images/Vector.png"}
                  width={15.82}
                  height={18.01}
                  className="relative -top-[10px]"
                />
                <a
                  href="#"
                  className="ml-2 font-serif font-bold text-[22px] md:text-[30px] tracking-wide text-green-800"
                >
                  NEATLY
                </a>
              </div>
            </div>

            {/* เมนูเดสก์ท็อป (ซ่อนบนมือถือ) */}
            <div className="hidden md:flex w-[444px]">
              <div className="py-[20px] px-[24px] text-center flex items-center justify-center">
                <a
                  href="#"
                  className="text-black text-[14px] font-inter leading-[16px]"
                >
                  About Neatly
                </a>
              </div>
              <div className="py-[20px] px-[24px] text-center flex items-center justify-center">
                <a
                  href="#"
                  className="text-black text-[14px] font-inter leading-[16px]"
                >
                  Service & Facilities
                </a>
              </div>
              <div className="py-[20px] px-[24px] text-center flex items-center justify-center">
                <a
                  href="#"
                  className="text-black text-[14px] font-inter leading-[16px]"
                >
                  Rooms & Suits
                </a>
              </div>
            </div>
          </div>

          {/* ปุ่ม Log in (เดสก์ท็อปเท่านั้น) */}
          <div className="hidden md:block w-[89px] py-[20px] px-[24px]">
            <a
              href="#"
              className="text-orange-500 text-[14px] font-semibold leading-[16px]"
            >
              Log in
            </a>
          </div>

          {/* ไอคอนเมนูมือถือ (ให้หน้าตาตรงรูป) */}
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded hover:bg-gray-100"
            aria-label="Menu"
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6">
              <path
                d="M3 6h18M3 12h18M3 18h18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </nav>

      {/* MAIN */}
      <main>
        <div className="bg-bg max-w-[1440px] mx-auto flex flex-col md:flex-row">
          {/* ซ้าย: รูป (มือถือสูง ~269px) */}
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
                <form onSubmit={handleSubmit}>
                  <div className="mb-5 md:mb-[40px]">
                    <label
                      htmlFor="email"
                      className="block mb-2 text-[15px] md:text-[16px] leading-[150%] text-gray-900"
                    >
                      Username or Email
                    </label>
                    <input
                      id="email"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your username or email"
                      className="w-full md:w-[452px] h-[48px] rounded border border-gray-300 bg-white pt-3 pr-4 pb-3 pl-3 text-[16px] outline-none placeholder:text-gray-500 focus:border-green-700 focus:ring-2 focus:ring-green-100 transition"
                    />
                    <p
                      className={`text-sm h-5 mt-1 ${
                        errors.username ? "text-red-500 visible" : "invisible"
                      }`}
                    >
                      {errors.username || "placeholder"}
                    </p>
                  </div>

                  <div className="mb-5 md:mb-[40px]">
                    <label
                      htmlFor="password"
                      className="block mb-2 text-[15px] md:text-[16px] leading-[150%] text-gray-900"
                    >
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
                    <p
                      className={`text-sm h-5 mt-1 ${
                        errors.password ? "text-red-500 visible" : "invisible"
                      }`}
                    >
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

                    {/* บรรทัด Register อยู่บรรทัดเดียวบนมือถือ */}
                    <div className="flex items-center gap-2">
                      <p className="font-inter text-[15px] md:text-[16px] leading-[150%] tracking-[-0.02em] text-gray-700">
                        Don’t have an account yet?
                      </p>
                      <a
                        href="/customer/register"
                        className="font-semibold text-orange-500 text-[15px] md:text-[16px] hover:underline"
                      >
                        Register
                      </a>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
