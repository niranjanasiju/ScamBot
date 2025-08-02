import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Image from "next/image";
import Bg from "@/assets/bg.png"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Simple Chatbot",
  description: "A simple chatbot that responds with 'abc' to any message",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Image src={Bg} alt="Background" className="absolute -z-10 w-full h-full object-cover" />
        {children}
      </body>
    </html>
  );
}
