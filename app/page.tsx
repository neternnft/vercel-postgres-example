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
        <div className="flex justify-center items-center mb-10 transition-transform duration-200 transform hover:scale-105">
          <Image
            src="/yoda.gif" // Updated to GIF file
            alt="Yoda GIF"
            width={180}
            height={37}
            className="dark:drop-shadow-[0_0_0.3rem_#ffffff70]"
            priority
            unoptimized // Added unoptimized property
          />
        </div>

        {/* Text */}
        <a
          className="group"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Meme is a game link"
        >
          <h2 className="mb-3 text-4xl font-semibold text-white"> {/* Updated font size */}
            MEME IS A GAME{" "}
            <span className="inline-block"></span>
          </h2>
        </a>

        {/* New Button */}
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4">
          START
        </button>

        {/* Links Section at the Bottom */}
        <div className="fixed bottom-0 left-0 right-0 flex justify-center mb-4">
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-4 max-w-5xl text-center">
            {/* X Link */}
            <button
              onClick={() => window.open("https://x.com/doitsol", "_blank")}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              X
            </button>

            {/* Telegram Link */}
            <button
              onClick={() => window.open("https://t.me/docommunity", "_blank")}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Telegram
            </button>

            {/* Dextools Link */}
            <button
              onClick={() =>
                window.open(
                  "https://www.dextools.io/app/en/solana/pair-explorer/4WUWq9zLvNpYJw9TrzMk74dsRmQgw3hMmKETyJnqt41J?t=1719616272327",
                  "_blank"
                )
              }
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Dextools
            </button>

            {/* Game.com Link */}
            <button
              onClick={() => window.open("https://game.com/", "_blank")}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Game.com
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
