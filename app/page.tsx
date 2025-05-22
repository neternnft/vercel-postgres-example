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
    // Function to update viewport height
    const updateViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    // Initial call
    updateViewportHeight();

    // Update on resize and orientation change
    window.addEventListener('resize', updateViewportHeight);
    window.addEventListener('orientationchange', updateViewportHeight);

    // Cleanup
    return () => {
      window.removeEventListener('resize', updateViewportHeight);
      window.removeEventListener('orientationchange', updateViewportHeight);
    };
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
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="h-[calc(var(--vh,1vh)*100)] bg-black flex flex-col items-center justify-between px-4 relative overflow-hidden">
        {/* Wallet Connect Button */}
        <div className="fixed top-[calc(var(--vh,1vh)*2)] right-4 z-20">
          <WalletConnect />
        </div>

        {/* Glurbnok Logo and Text */}
        <div className="fixed top-[calc(var(--vh,1vh)*2)] left-4 z-10 flex items-center space-x-2">
          <Image
            src="/logo.png"
            alt="Logo"
            width={70}
            height={70}
            className="object-contain w-[40px] h-[40px] sm:w-[50px] sm:h-[50px] md:w-[70px] md:h-[70px]"
          />
          <h1
            className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold"
            style={{ color: "#54CA9B" }}
          >
            Glurbnok
          </h1>
        </div>

        {/* Main Content Container */}
        <div className="flex flex-col items-center justify-center h-[calc(var(--vh,1vh)*50)] mt-[calc(var(--vh,1vh)*10)]">
          {/* Centered Image */}
          <div className="w-full max-w-[min(320px,80vw)]">
            <Image
              src="/yoda.gif"
              alt="Yoda GIF"
              width={320}
              height={65}
              className="pixelated w-full h-auto"
              priority
              unoptimized
            />
          </div>

          {/* Text */}
          <div className="mt-[calc(var(--vh,1vh)*2)]">
            <motion.a
              className="group"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Meme is a game link"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white text-center whitespace-nowrap">
                MEME IS A GAME
              </h2>
            </motion.a>
          </div>

          {/* Start Button */}
          <motion.div
            className="mt-[calc(var(--vh,1vh)*3)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <motion.button
              style={{ backgroundColor: "#54CA9B" }}
              className="text-black font-bold py-[calc(var(--vh,1vh)*1.5)] px-[3vw] rounded-lg shadow-md transition-colors duration-300 text-base sm:text-lg md:text-xl"
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
        <div className="w-full mb-[calc(var(--vh,1vh)*4)] mt-auto">
          <div className="container mx-auto grid grid-cols-3 gap-[2vw] max-w-3xl text-center px-4">
            {/* X Link */}
            <button
              onClick={() => window.open("https://x.com/glurbnok", "_blank")}
              style={{ backgroundColor: "#54CA9B" }}
              className="text-black font-bold py-[calc(var(--vh,1vh)*1)] px-[1.5vw] rounded-lg shadow-md transition-colors duration-300 text-xs sm:text-sm md:text-base"
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
              className="text-black font-bold py-[calc(var(--vh,1vh)*1)] px-[1.5vw] rounded-lg shadow-md transition-colors duration-300 text-xs sm:text-sm md:text-base"
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
              className="text-black font-bold py-[calc(var(--vh,1vh)*1)] px-[1.5vw] rounded-lg shadow-md transition-colors duration-300 text-xs sm:text-sm md:text-base"
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