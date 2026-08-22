"use client";

import { useEffect, useState } from "react";
import { Copy, Smartphone } from "lucide-react";

interface PhoneHandoffQrProps {
  path?: string;
}

export default function PhoneHandoffQr({ path = "/report" }: PhoneHandoffQrProps) {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setUrl(`${window.location.origin}${path}`);
  }, [path]);

  async function copyLink() {
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!url) return null;

  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(url)}`;

  return (
    <div className="rounded-xl bg-teal-50 p-4 ring-1 ring-teal-100">
      <div className="flex items-center gap-2 text-sm font-medium text-teal-900">
        <Smartphone className="h-4 w-4" />
        Continue on your phone
      </div>
      <p className="mt-1 text-xs text-teal-700">
        Scan for better camera and GPS, or copy the link to your mobile browser.
      </p>
      <div className="mt-3 flex items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qrSrc}
          alt="QR code to open report page on phone"
          width={120}
          height={120}
          className="rounded-lg bg-white p-1"
        />
        <button
          type="button"
          onClick={copyLink}
          className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium text-teal-800 ring-1 ring-teal-200 hover:bg-teal-100"
        >
          <Copy className="h-4 w-4" />
          {copied ? "Copied!" : "Copy link"}
        </button>
      </div>
    </div>
  );
}
