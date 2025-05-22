"use client";

import Image from "next/image";
import Head from "next/head";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Game from "./game";
import WalletConnect from "./components/WalletConnect";

export default function Home() {
  const [showGame, setShowGame] = useState(false);

  // Handle mobile viewport height
  useEffect(() => {
    const setHeight = () => {
      document.documentElement.style.setProperty(
        '--app-height',
        `${window.innerHeight}px`
      );
    };
    setHeight();
    window.addEventListener('resize', setHeight);
    return () => window.removeEventListener('resize', setHeight);
  }, []);

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
        <meta 
          name="viewport" 
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" 
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <style jsx global>{`
        :root {
          --app-height: 100vh;
        }
        html,
        body {
          padding: 0;
          margin: 0;
          overflow: hidden;
          position: fixed;
          width: 100%;
          height: 100%;
        }
      `}</style>
      <main 
        className="bg-black flex flex-col overflow-hidden w-full"
        style={{ height: 'var(--app-height)' }}
      >
        {/* Top Bar */}
        <div className="shrink-0 h-16 flex justify-between items-center px-4 sm:px-6 md:px-8 mt-4">
          {/* Logo and Text */}
          <div className="flex items-center space-x-2">
            <Image
              src="/logo.png"
              alt="Logo"
              width={70}
              height={70}
              className="object-contain w-[30px] h-[30px] sm:w-[40px] sm:h-[40px] md:w-[50px] md:h-[50px]"
            />
            <h1
              className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold"
              style={{ color: "#54CA9B" }}
            >
              Glurbnok
            </h1>
          </div>
          
          {/* Wallet Connect */}
          <div>
            <WalletConnect />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 md:px-8 min-h-0 -mt-8">
          <div className="flex flex-col items-center justify-center gap-12 max-w-[min(320px,80vw)]">
            {/* Text */}
            <motion.a
              className="group"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Meme is a game link"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white text-center whitespace-nowrap tracking-wider"
                  style={{ textShadow: '0 0 10px rgba(84, 202, 155, 0.5)' }}
              >
                MEME IS A GAME
              </h2>
            </motion.a>

            {/* Start Button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-4"
            >
              <motion.button
                style={{ backgroundColor: "#54CA9B" }}
                className="text-black font-bold py-3 px-8 rounded-lg shadow-md transition-colors duration-300 text-lg sm:text-xl md:text-2xl"
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
        </div>

        {/* Bottom Links */}
        <div className="shrink-0 h-12 flex items-center px-4 sm:px-6 md:px-8 mb-2">
          <div className="w-full grid grid-cols-3 gap-3 max-w-3xl mx-auto text-center">
            {/* X Link */}
            <button
              onClick={() => window.open("https://x.com/glurbnok", "_blank")}
              style={{ backgroundColor: "#54CA9B" }}
              className="text-black font-bold py-2 px-3 rounded-lg shadow-md transition-colors duration-300 text-xs sm:text-sm md:text-base"
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
              className="text-black font-bold py-2 px-3 rounded-lg shadow-md transition-colors duration-300 text-xs sm:text-sm md:text-base"
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
              className="text-black font-bold py-2 px-3 rounded-lg shadow-md transition-colors duration-300 text-xs sm:text-sm md:text-base"
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