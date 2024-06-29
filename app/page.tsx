"use client"; // Add this line to mark the component as a Client Component

import Image from "next/image";
import Head from "next/head";
import { useState } from "react";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      <Head>
        <title>DO</title>
        <meta name="description" content="A fun and interactive website with links to various resources." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center p-10">
        <p className="fixed left-0 top-0 flex w-full justify-start items-center from-zinc-200 pb-6 pt-8">
          <code className="font-mono font-bold text-white px-10 py-5 text-4xl">DO</code>
        </p>

        {/* Centered Image */}
        <div className="flex justify-center items-center mb-10">
          {isLoading && <div className="loader">Loading...</div>}
          <Image
            src="/yoda.gif" // Updated to GIF file
            alt="Yoda GIF"
            width={180}
            height={37}
            className="dark:drop-shadow-[0_0_0.3rem_#ffffff70] dark:invert"
            priority
            unoptimized // Added unoptimized property
            onLoadingComplete={() => setIsLoading(false)}
          />
        </div>

        {/* Dextools Link */}
        <a
          className="group"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Meme is a game link"
        >
          <h2 className="mb-3 text-4xl font-semibold text-white transition-transform duration-200 transform hover:scale-105"> {/* Updated font size */}
            MEME IS A GAME{" "}
            <span className="inline-block"></span>
          </h2>
        </a>

        {/* Links Section at the Bottom */}
        <div className="fixed bottom-0 left-0 right-0 flex justify-center mb-4">
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-4 max-w-5xl text-center">
            {/* X Link */}
            <a
              href="https://x.com/doitsol"
              className="group rounded-lg border border-gray-300 px-2 py-2 transition-colors bg-yellow-100 dark:border-neutral-700 dark:bg-neutral-800"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X link"
            >
              <h2 className="mb-2 text-sm font-semibold transform hover:scale-105">
                X{" "}
                <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                  -&gt;
                </span>
              </h2>
            </a>

            {/* Telegram Link */}
            <a
              href="https://t.me/docommunity"
              className="group rounded-lg border border-gray-300 px-2 py-2 transition-colors bg-green-100 dark:border-neutral-700 dark:bg-neutral-800"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Telegram link"
            >
              <h2 className="mb-2 text-sm font-semibold transform hover:scale-105">
                telegram{" "}
                <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                  -&gt;
                </span>
              </h2>
            </a>

            {/* Dextools Link */}
            <a
              href="https://www.dextools.io/app/en/solana/pair-explorer/4WUWq9zLvNpYJw9TrzMk74dsRmQgw3hMmKETyJnqt41J?t=1719616272327"
              className="group rounded-lg border border-gray-300 px-2 py-2 transition-colors bg-blue-100 dark:border-neutral-700 dark:bg-neutral-800"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Dextools link"
            >
              <h2 className="mb-2 text-sm font-semibold transform hover:scale-105">
                dextools{" "}
                <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                  -&gt;
                </span>
              </h2>
            </a>

            {/* Game.com Link */}
            <a
              href="https://game.com/"
              className="group rounded-lg border border-gray-300 px-2 py-2 transition-colors bg-red-100 dark:border-neutral-700 dark:bg-neutral-800"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Game.com link"
            >
              <h2 className="mb-2 text-sm font-semibold transform hover:scale-105">
                game.com{" "}
                <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                  -&gt;
                </span>
              </h2>
            </a>
          </div>
        </div>
      </main>
    </>
  );
}
