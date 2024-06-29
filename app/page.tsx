import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-10">
      {/* Logo Section */}
      <div className="flex justify-start mb-10 bg-white">
        <a href="/" className="flex justify-start">
          <Image
            src="/DoLabs.svg"
            alt="DoLabs Logo"
            width={100}
            height={37}
            priority
          />
        </a>
      </div>

      {/* Yoda Image Centered */}
      <div className="relative z-[-1] flex justify-center items-center mb-10">
        <Image
          src="/yoda.svg"
          alt="Yoda Logo"
          width={180}
          height={37}
          className="dark:drop-shadow-[0_0_0.3rem_#ffffff70] dark:invert"
          priority
        />
      </div>

      {/* Links Section */}
      <div className="mb-32 grid gap-4 lg:grid-cols-4 lg:max-w-5xl lg:text-left">
        {/* X Link */}
        <a
          href="https://x.com/doitsol"
          className="group rounded-lg border border-gray-300 px-5 py-4 transition-colors bg-yellow-100 dark:border-neutral-700 dark:bg-neutral-800"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className="mb-3 text-2xl font-semibold">
            X{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
        </a>

        {/* Telegram Link */}
        <a
          href="https://t.me/docommunity"
          className="group rounded-lg border border-gray-300 px-5 py-4 transition-colors bg-green-100 dark:border-neutral-700 dark:bg-neutral-800"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className="mb-3 text-2xl font-semibold">
            telegram{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
        </a>

        {/* Dextools Link */}
        <a
          href="https://www.dextools.io/app/en/solana/pair-explorer/4WUWq9zLvNpYJw9TrzMk74dsRmQgw3hMmKETyJnqt41J?t=1719616272327"
          className="group rounded-lg border border-gray-300 px-5 py-4 transition-colors bg-blue-100 dark:border-neutral-700 dark:bg-neutral-800"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className="mb-3 text-2xl font-semibold">
            dextools{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
        </a>

        {/* Game.com Link */}
        <a
          href="https://game.com/"
          className="group rounded-lg border border-gray-300 px-5 py-4 transition-colors bg-red-100 dark:border-neutral-700 dark:bg-neutral-800"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className="mb-3 text-2xl font-semibold">
            game.com{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
        </a>
      </div>
    </main>
  );
}
