import "@/styles/globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { HotelInfoProvider } from "@/context/HotelInfoContext";
import type { AppProps } from "next/app";
<<<<<<< HEAD
import Script from "next/script";
import { useEffect } from "react";
import { useRouter } from "next/router";
import * as gtag from "../lib/gtag";
=======
import { AuthProvider } from "@/context/AuthContext";
>>>>>>> dd737d9 (feat: create CustomerLoginPage component with integrated LoginForm and responsive layout)

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      gtag.pageview(url);
    };
    router.events.on("routeChangeComplete", handleRouteChange);
    return () => router.events.off("routeChangeComplete", handleRouteChange);
  }, [router.events]);

  return (
<<<<<<< HEAD
    <>
      {/* GA Script */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', { send_page_view: false });
        `}
      </Script>
      <AuthProvider>
        <HotelInfoProvider>
          <Component {...pageProps} />
        </HotelInfoProvider>
      </AuthProvider>
    </>
  );
=======
  <AuthProvider>
    <Component {...pageProps} />
  </AuthProvider>
  )
  
>>>>>>> dd737d9 (feat: create CustomerLoginPage component with integrated LoginForm and responsive layout)
}