"use client";

import { useStore } from "~/store";

export default function Account() {
  const { initialized, nationality, wallet } = useStore();

  if (!initialized) {
    return <div>Loading...</div>;
  }

  if (!wallet) {
    return <div>No wallet found. Please connect your wallet.</div>;
  }

  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-bold">Account Details</h1>

      <div className="space-y-4">
        <div>
          <strong>Nationality:</strong> {nationality || "Not specified"}
        </div>
      </div>
    </div>
  );
}
