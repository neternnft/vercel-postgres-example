"use client";

import Image from "next/image";
import Head from "next/head";
import { motion } from "framer-motion";
import { useState } from "react";
import Game from "./game";
import WalletConnect from "./components/WalletConnect";

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
      <main className="min-h-screen bg-black flex flex-col items-center justify-between px-4 py-8 relative overflow-hidden">
        {/* Wallet Connect Button */}
        <div className="fixed top-4 right-4 z-20">
          <WalletConnect />
        </div>

        {/* Glurbnok Logo and Text */}
        <div className="fixed top-4 left-4 z-10 flex items-center space-x-2">
          <Image
            src="/logo.png"
            alt="Logo"
            width={70}
            height={70}
            className="object-contain w-[50px] h-[50px] sm:w-[70px] sm:h-[70px]"
          />
          <h1
            className="text-2xl sm:text-4xl md:text-5xl font-bold"
            style={{ color: "#54CA9B" }}
          >
            Glurbnok
          </h1>
        </div>

        {/* Main Content Container */}
        <div className="flex flex-col items-center justify-center flex-grow mt-20 mb-4">
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

          {/* Start Button */}
          <motion.div
            className="mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <motion.button
              style={{ backgroundColor: "#54CA9B" }}
              className="text-black font-bold py-4 px-8 rounded-lg shadow-md transition-colors duration-300 mb-8 text-xl"
              animate={{
                boxShadow: [
                  "0 0 0 0 rgba(84, 202, 155, 0.7)",
                  "0 0 0 20px rgba(84, 202, 155, 0)",
                ],
                transition: {
                  repeat: Infinity,
                  repeatType: "reverse",
                  duration: 3,
                },
              }}
              onClick={handleStartClick}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#42A97A")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#54CA9B")
              }
            >
              PLAY
            </motion.button>
          </motion.div>
        </div>

        {/* Links Section at the Bottom */}
        <div className="w-full mt-auto">
          <div className="container mx-auto grid grid-cols-3 gap-4 max-w-3xl text-center px-4">
            {/* X Link */}
            <button
              onClick={() => window.open("https://x.com/glurbnok", "_blank")}
              style={{ backgroundColor: "#54CA9B" }}
              className="text-black font-bold py-2 px-4 rounded-lg shadow-md transition-colors duration-300"
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#42A97A")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#54CA9B")
              }
            >
              X
            </button>

            {/* Arena Link */}
            <button
              onClick={() =>
                window.open("https://arena.social/glurbnok", "_blank")
              }
              style={{ backgroundColor: "#54CA9B" }}
              className="text-black font-bold py-2 px-4 rounded-lg shadow-md transition-colors duration-300"
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#42A97A")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#54CA9B")
              }
            >
              ARENA
            </button>

            {/* Buy Link */}
            <button
              onClick={() =>
                window.open(
                  "https://arena.social/glurbnok/status/5aec79f7-ecae-45a8-9978-d3bbb0920b6f",
                  "_blank"
                )
              }
              style={{ backgroundColor: "#54CA9B" }}
              className="text-black font-bold py-2 px-4 rounded-lg shadow-md transition-colors duration-300"
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#42A97A")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#54CA9B")
              }
            >
              BUY
            </button>
          </div>
        </div>

        {showGame && <Game onClose={() => setShowGame(false)} />}
      </main>
    </>
  );
}