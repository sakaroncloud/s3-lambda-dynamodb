import { AntdRegistry } from "@ant-design/nextjs-registry";
import "./globals.css";
import { Poppins } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { ClerkProvider, SignedIn, UserButton } from "@clerk/nextjs";
import TanstackProvider from "@/components/tanstack-provider";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export const metadata = {
  title: "S3 With Lambda and DynamoDB",
  description: "A simple Next.js app to store image in AWS S3",
};

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  display: "swap",
  weight: ["100", "300", "400"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <TanstackProvider>
        <html lang="en">
          <body className={`${poppins.className} relative`}>
            <div className="fixed bottom-20 right-10 z-50">
              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>
            <Toaster />
            <AntdRegistry>{children}</AntdRegistry>
            <ReactQueryDevtools
              buttonPosition="bottom-left"
              initialIsOpen={false}
            />
          </body>
        </html>
      </TanstackProvider>
    </ClerkProvider>
  );
}
