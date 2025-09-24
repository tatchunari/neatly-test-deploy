import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Herosection from "@/components/Herosection";
import Aboutsection from "@/components/Aboutsection";
import Servicesection from "@/components/Servicesection";
import Roomwrapper from "@/components/Roomwrapper";
import Testimonial from "@/components/Testimonial";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  
  // Check if current page is admin login or other admin pages
  const isAdminPage = router.pathname.startsWith('/admin');
  
  // For admin pages, render only the component without main page layout
  if (isAdminPage) {
    return <Component {...pageProps} />;
  }
  
  // For all other pages, render the main page layout
  return (
  <AuthProvider>
    <Component {...pageProps} />
  </AuthProvider>
  )
  
}
