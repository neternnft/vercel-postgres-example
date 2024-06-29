import Image from "next/image";



export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-10">
      <div className="z-10 max-w-10xl items-center justify-between lg:flex">
        <p className="fixed right-20 top-5 flex  justify-center bg-gradient-to-b from-zinc-50 dark:from-inherit lg:static lg:w-auto">         
          <Image
            className="relative dark:drop-shadow-[0_0_0.3rem_#ffffff70] dark:invert"
            src="/DoLabs.svg"
            alt="Dolabs Logo"
            width={100}
            height={37}
            priority
          />
        </p>
      </div>

      <div className="relative z-[-1] flex place-items-center before:absolute before:h-[300px] before:w-full before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-full after:translate-x-1/3">
        <Image
          className="relative dark:drop-shadow-[0_0_0.3rem_#ffffff70] dark:invert"
          src="/yoda.svg"
          alt="yoda Logo"
          width={180}
          height={37}
          priority
        />
      </div>

      <div className="mb-32 grid text-center lg:mb-0 lg:w-full lg:max-w-5xl lg:grid-cols-4 lg:text-left">
        <a
          href="https://x.com/doitsol"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-yellow-200 hover:bg-yellow-200 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
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
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-green-200 hover:bg-green-200 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
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
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-blue-200 hover:bg-blue-200 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
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
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-red-200 hover:bg-red-200 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
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
