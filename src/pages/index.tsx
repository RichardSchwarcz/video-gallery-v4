import { signIn } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import Image from "next/image";
import Database from "../assets/Database.webp";

export default function Home() {
  return (
    <>
      <Head>
        <title>Notion Video Gallery</title>
        <meta name="description" content="Sync youtube playlists with notion" />
      </Head>
      <div className="flex items-center justify-end gap-8 border-b-[1px] p-4 pr-20 ">
        <Link href={""}>Docs</Link>
        <Link href={""}>Pricing</Link>
        <Button onClick={() => void signIn()}>Get Started</Button>
      </div>
      {/* HERO SECTION */}
      <div className="m-10 flex border">
        <p className="w-1/3 pl-10 pt-10 text-3xl font-extrabold leading-normal">
          Sync your youtube playlists with Notion databases!
        </p>
        <Image width={500} height={400} alt="Picture" src={Database} />
      </div>
      {/* HOW IT WORKS */}
      <div className="flex justify-center text-xl font-extrabold">
        How it works
      </div>
    </>
  );
}
