import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-10">
      <p className="fixed left-0 top-0 flex w-full justify-start items-center from-zinc-200 pb-6 pt-8">
        <code className="font-mono font-bold text-white px-10 py-5 text-4xl">DO</code>
      </p>

      {/* Centered Image */}
      <div className="flex justify-center items-center mb-10">
        <Image
          src="/yoda.svg"
          alt="Yoda Logo"
          width={180}
          height={37}
          className="dark:drop-shadow-[0_0_0.3rem_#ffffff70] dark:invert"
          priority
        />
      </div>

      {/* Dextools Link */}
      <a
        className="group"
        target="_blank"
        rel="noopener noreferrer"
      >
        <h2 className="mb-3 text-lg font-semibold text-white ">
          MEME IS A GAME{" "}
          <span className="inline-block"></span>
        </h2>
      </a>

      {/* Links Section */}
      <div className="mb-32 grid gap-4 lg:grid-cols-4 lg:max-w-5xl lg:text-left">
        {/* X Link */}
        <a
          href="https://x.com/doitsol"
          className="group rounded-lg border border-gray-300 px-3 py-3 transition-colors bg-yellow-100 dark:border-neutral-700 dark:bg-neutral-800"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className="mb-3 text-lg font-semibold">
            X{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
        </a>

        {/* Telegram Link */}
        <a
          href="https://t.me/docommunity"
          className="group rounded-lg border border-gray-300 px-3 py-3 transition-colors bg-green-100 dark:border-neutral-700 dark:bg-neutral-800"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className="mb-3 text-lg font-semibold">
            telegram{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
        </a>

        {/* Dextools Link */}
        <a
          href="https://www.dextools.io/app/en/solana/pair-explorer/4WUWq9zLvNpYJw9TrzMk74dsRmQgw3hMmKETyJnqt41J?t=1719616272327"
          className="group rounded-lg border border-gray-300 px-3 py-3 transition-colors bg-blue-100 dark:border-neutral-700 dark:bg-neutral-800"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className="mb-3 text-lg font-semibold">
            dextools{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
        </a>

        {/* Game.com Link */}
        <a
          href="https://game.com/"
          className="group rounded-lg border border-gray-300 px-3 py-3 transition-colors bg-red-100 dark:border-neutral-700 dark:bg-neutral-800"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className="mb-3 text-lg font-semibold">
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
