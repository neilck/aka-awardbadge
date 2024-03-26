import "../globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { getServerSession } from "next-auth";
import SessionProvider from "./SessionProvider";
import ThemeRegistry from "@/app/components/ThemeRegistry/ThemeRegistry";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default async function YtLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider session={session}>
          <ThemeRegistry>{children}</ThemeRegistry>
        </SessionProvider>
      </body>
    </html>
  );
}