"use client";

import Image from "next/image";

import { TabNavigation } from "@/components/PageTabs";

import blobsImage from "@/guidance/3d Liquid Blobs (LexiQ - shadow).png";

export function MeettheTeamBackgroundV1() {
  return (
    <div
      className="fixed inset-0 -z-10 flex flex-col"
      style={{ backgroundColor: "#001e25" }}
    >
      <header className="flex items-center justify-between px-8 py-6">
        <TabNavigation current="team" />
        <div className="flex items-center gap-4">
          <Image
            src="/LexiQ_Team_Logo_(white).png"
            alt="LexiQ logo"
            width={140}
            height={48}
            priority
          />
          <span className="text-xs font-medium uppercase tracking-[0.28em] text-white/60">
            Meet the Team
          </span>
        </div>
      </header>
      <div className="relative flex-1 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-end px-8">
          <Image
            src={blobsImage}
            alt="LexiQ sculpted liquid blobs"
            className="h-auto w-[min(48vw,620px)] translate-y-10 object-contain drop-shadow-[0_15px_45px_rgba(0,0,0,0.65)]"
          />
        </div>
      </div>
    </div>
  );
}
