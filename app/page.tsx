"use client";

import Image from "next/image";
import Head from "next/head";
import { motion } from "framer-motion";
import { useState } from 'react';
import Game from './game';

export default function Home() {
  const [showGame, setShowGame] = useState(false);

  const handleStartClick = () => {
    setShowGame(true);
  };

  return (
    <>
      <Head>
        <title>Glurbnok</title>
        <meta
          name="description"
          content="A fun and interactive website with links to various resources."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="min-h-screen bg-black flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden">
        {/* Glurbnok Text */}
        <div className="fixed top-4 left-4 z-10">
          <h1 className="text-4xl sm:text-5xl font-bold text-green-400">Glurbnok</h1>
        </div>

        {/* Unmovable Container */}
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
          {/* Centered Image */}
          <div>
            <Image
              src="/yoda.gif"
              alt="Yoda GIF"
              width={320}
              height={65}
              className="pixelated"
              priority
              unoptimized
            />
          </div>

          {/* Text */}
          <div className="mt-4">
            <motion.a
              className="group mb-4"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Meme is a game link"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2 text-center whitespace-nowrap">
                MEME IS A GAME
              </h2>
            </motion.a>
          </div>

          {/* New Button */}
          <motion.div
            className="mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <motion.button
              className="bg-green-400 hover:bg-green-500 text-black font-bold py-4 px-8 rounded-lg shadow-md transition-colors duration-300 mb-8 text-xl"
              animate={{
                boxShadow: [
                  "0 0 0 0 rgba(46, 204, 113, 0.7)",
                  "0 0 0 20px rgba(46, 204, 113, 0)",
                ],
                transition: {
                  repeat: Infinity,
                  repeatType: "reverse",
                  duration: 3,
                },
              }}
              onClick={handleStartClick}
            >
              PLAY
            </motion.button>
          </motion.div>
        </div>

        {/* Links Section at the Bottom */}
        <div className="fixed bottom-0 left-0 right-0 mb-4 sm:mb-8">
          <div className="container mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-5xl text-center">
            {/* X Link */}
            <button
              onClick={() => window.open("https://x.com/netern_sol", "_blank")}
              className="bg-green-400 hover:bg-green-500 text-black font-bold py-2 px-4 rounded-lg shadow-md transition-colors duration-300"
            >
              X
            </button>

            {/* Telegram Link */}
            <button
              onClick={() => window.open("https://t.me/neternsol", "_blank")}
              className="bg-green-400 hover:bg-green-500 text-black font-bold py-2 px-4 rounded-lg shadow-md transition-colors duration-300"
            >
              Telegram
            </button>

            {/* Dextools Link */}
            <button
              onClick={() =>
                window.open(
                  "https://t.me/neternsol",
                  "_blank"
                )
              }
              className="bg-green-400 hover:bg-green-500 text-black font-bold py-2 px-4 rounded-lg shadow-md transition-colors duration-300"
            >
              Arena
            </button>

            {/* Game.com Link */}
            <button
              onClick={() => window.open("https://arena.social/glurbnok", "_blank")}
              className="bg-green-400 hover:bg-green-500 text-black font-bold py-2 px-4 rounded-lg shadow-md transition-colors duration-300"
            >
              Buy
            </button>
          </div>
        </div>

        {showGame && <Game onClose={() => setShowGame(false)} />}
      </main>
    </>
  );
}
