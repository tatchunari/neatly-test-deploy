import React from "react";
import Head from "next/head";
import Navbar from "@/components/Navbar";
import { RegisterForm } from "@/components/customer/forms/RegisterForm";

const RegisterPage = () => {
  return (
    <>
      <Head>
        <title>Register - Neatly</title>
        <meta
          name="description"
          content="Register for Neatly to start using our services"
        />
      </Head>

      {/* Navbar */}
      <Navbar
        navItems={[
          { label: "About Neatly", path: "/" },
          { label: "Service & Facilities", path: "/" },
          { label: "Rooms & Suits", path: "/" },
        ]}
        loginLabel="Log in"
      />

      {/* Main Content with Background */}
      <div className="min-h-screen bg-cover bg-center bg-no-repeat relative">
        {/* Overlay */}
        <div
          className="absolute inset-0 bg-black bg-opacity-20"
          style={{
            backgroundImage: "url('/Images/register-bg.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        ></div>

        {/* Form Container */}
        <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-20">
          <div className="w-full max-w-4xl">
            <div className="bg-[var(--color-bg)] backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden">
              {/* Form Header */}
              <div className="px-[80px] pt-[80px] pb-6">
                <h1 className="text-[68px] font-medium leading-[125%] tracking-[-2%] font-noto text-left text-[var(--color-green-800)]">
                  Register
                </h1>
              </div>

              {/* Form Content */}
              <div className="px-[80px] pb-[80px]">
                <RegisterForm />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;
