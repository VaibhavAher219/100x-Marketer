import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { ToastProvider } from "@/components/shared/Toast";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "100x Marketers",
  description: "Transform your marketing skills and become a 100x marketer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>
          <AuthProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </AuthProvider>
        </ErrorBoundary>
        
        {/* Intercom Settings */}
        <Script
          id="intercom-settings"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.intercomSettings = {
                api_base: "https://api-iam.intercom.io",
                app_id: "f51iam9l",
              };
            `,
          }}
        />
        
        {/* Intercom Widget */}
        <Script
          id="intercom-widget"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(){var w=window;var ic=w.Intercom;if(typeof ic==="function"){ic('reattach_activator');ic('update',w.intercomSettings);}else{var d=document;var i=function(){i.c(arguments);};i.q=[];i.c=function(args){i.q.push(args);};w.Intercom=i;var l=function(){var s=d.createElement('script');s.type='text/javascript';s.async=true;s.src='https://widget.intercom.io/widget/f51iam9l';var x=d.getElementsByTagName('script')[0];x.parentNode.insertBefore(s,x);};if(document.readyState==='complete'){l();}else if(w.attachEvent){w.attachEvent('onload',l);}else{w.addEventListener('load',l,false);}}})();
            `,
          }}
        />
      </body>
    </html>
  );
}
