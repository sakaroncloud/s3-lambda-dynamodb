"use client";
import { Gallery } from "@/components/gallery";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-black w-full max-w-[1960px] p-4 mx-auto">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        <Gallery />
      </div>
    </main>
  );
}
