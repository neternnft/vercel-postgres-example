import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-10">
      {/* First Image Positioned on the Left */}
      <div className="w-full flex justify-start mb-10">
        <a className="flex justify-start bg-gradient-to-b from-zinc-50">
          <Image
            className="relative dark:drop-shadow-[0_0_0.3rem_#ffffff70] dark:invert"
            src="/DoLabs.svg"
            alt="Dolabs Logo"
            width={100}
            height={37}
            priority
          />
        </a>
      </div>

      {/* Second Image Centered */}
      <div className="relative z-[-1] flex justify-center place-items-center mb-10">
        <Image
          className="relative dark:drop-shadow-[0_0_0.3rem_#ffffff70] dark:invert"
          src="/yoda.svg"
          alt="Yoda Logo"
          width={180}
          height={37}
          priority
        />
      </div>

      {/* Links Section */}
      <div className="mb-32 grid text-center lg:mb-0 lg:w-full lg:max-w-5xl lg:grid-cols-4 lg:text-left gap-4">
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
