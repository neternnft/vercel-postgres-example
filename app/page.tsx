"use client";

import Image from "next/image";
import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>DO</title>
        <meta
          name="description"
          content="A fun and interactive website with links to various resources."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="min-h-screen bg-black flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden">
        {/* DO Text */}
        <div className="fixed top-4 left-4 z-10">
          <h1 className="text-4xl sm:text-5xl font-bold text-green-400 font-pixel">
            DO
          </h1>
        </div>

        {/* Unmovable Container */}
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
          {/* Centered Image */}
          <div>
            <Image
              src="/yoda.gif"
              alt="Yoda GIF"
              width={180}
              height={37}
              className="pixelated"
              priority
              unoptimized
            />
          </div>

          {/* Text */}
          <div className="mt-4">
            <a
              className="group mb-4"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Meme is a game link"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-white font-pixel mb-2 text-center whitespace-nowrap">
                MEME IS A GAME
              </h2>
            </a>
          </div>

          {/* New Button */}
          <div>
            <button className="bg-green-400 hover:bg-green-500 text-black font-bold py-3 px-6 rounded-lg shadow-md transition-colors duration-300 mb-8 font-pixel">
              START
            </button>
          </div>
        </div>

        {/* Links Section at the Bottom */}
        <div className="fixed bottom-0 left-0 right-0 mb-4 sm:mb-8">
          <div className="container mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-5xl text-center">
            {/* X Link */}
            <button
              onClick={() => window.open("https://x.com/doitsol", "_blank")}
              className="bg-green-400 hover:bg-green-500 text-black font-bold py-2 px-4 rounded-lg shadow-md transition-colors duration-300 font-pixel"
            >
              X
            </button>

            {/* Telegram Link */}
            <button
              onClick={() => window.open("https://t.me/docommunity", "_blank")}
              className="bg-green-400 hover:bg-green-500 text-black font-bold py-2 px-4 rounded-lg shadow-md transition-colors duration-300 font-pixel"
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
              className="bg-green-400 hover:bg-green-500 text-black font-bold py-2 px-4 rounded-lg shadow-md transition-colors duration-300 font-pixel"
            >
              Dextools
            </button>

            {/* Game.com Link */}
            <button
              onClick={() => window.open("https://game.com/", "_blank")}
              className="bg-green-400 hover:bg-green-500 text-black font-bold py-2 px-4 rounded-lg shadow-md transition-colors duration-300 font-pixel"
            >
              Game.com
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
