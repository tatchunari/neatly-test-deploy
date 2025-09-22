import type { AppProps } from "next/app";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Herosection from "@/components/Herosection";
import Aboutsection from "@/components/Aboutsection";
import Servicesection from "@/components/Servicesection";
import Roomwrapper from "@/components/Roomwrapper";
import Testimonial from "@/components/Testimonial";
<<<<<<< HEAD
import Chatbot from "@/components/Chatbot";

import * as gtag from "../lib/gtag";
import { useEffect } from "react";

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    gtag.pageview("/", "Home Page");
  }, []);

  return (
    <div className="pt-12 md:pt-[100px] overflow-x-hidden">
=======
// โค้ดนี้คือฟังก์ชัน App ซึ่งเป็น entry point หลักของ Next.js สำหรับการกำหนด layout ของแอปพลิเคชัน
// ฟังก์ชันนี้รับ props คือ Component (คอมโพเนนต์ของแต่ละหน้า) และ pageProps (props ของแต่ละหน้า)
// ใน return จะมี div ที่กำหนด padding-top ด้านบน (pt-12 สำหรับ mobile, md:pt-[100px] สำหรับหน้าจอขนาดกลางขึ้นไป)
// ภายใน div จะเรียกใช้ <NavBar /> เพื่อแสดงแถบนำทางด้านบน และ <Component {...pageProps} /> เพื่อแสดงเนื้อหาของแต่ละหน้า

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="pt-12 md:pt-[100px]">
>>>>>>> dd737d9 (feat: create CustomerLoginPage component with integrated LoginForm and responsive layout)
      <Navbar />
      <Herosection />
      <Aboutsection />
      <Servicesection />
      <Roomwrapper />
      <Testimonial />
      <Footer />
<<<<<<< HEAD

      {/* Chatbot Button */}
      <Chatbot />
=======
>>>>>>> dd737d9 (feat: create CustomerLoginPage component with integrated LoginForm and responsive layout)
    </div>
  );
}