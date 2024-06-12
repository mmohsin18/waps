"use client";

import Image from "next/image";
import React from "react";
import { useRouter } from "next/navigation";
import { RotateCw } from "lucide-react";

export default function Offline() {
  const router = useRouter();

  return (
    <div className="container flex flex-col items-center">
      <Image
        className="mt-32"
        width={250}
        height={250}
        alt="offline"
        src={"/images/Loading-Time.svg"}
      />
      <h2 className="mt-2 text-center  text-2xl font-semibold font-mono">
        Oops! It Looks Like You're Offline
      </h2>

      <button
        className="cursor-pointer mt-8"
        type="button"
        onClick={() => router.back()}
      >
        <div className="flex items-center">
          <span className="text-2xl font-semibold font-mono underline">
            Retry
          </span>
          <RotateCw className="ml-2" width={21} height={21} />
        </div>
      </button>
    </div>
  );
}
