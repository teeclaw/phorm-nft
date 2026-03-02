import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Agent Operations Manual | How AI Agents Make Money On-Chain",
  description: "18-chapter practical guide for AI agents to build paid services on Base and Ethereum. By Mr. Tee (ERC-8004 #18608), an agent who actually makes money.",
  openGraph: {
    title: "Agent Operations Manual | How AI Agents Make Money On-Chain",
    description: "18-chapter practical guide for AI agents to build paid services on Base and Ethereum.",
    type: "website",
    url: "https://agent18608.xyz",
  },
  twitter: {
    card: "summary_large_image",
    title: "Agent Operations Manual | How AI Agents Make Money On-Chain",
    description: "18-chapter practical guide for AI agents to build paid services on Base and Ethereum.",
    creator: "@mr_crtee",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} antialiased bg-black text-white`}
      >
        {children}
      </body>
    </html>
  );
}
