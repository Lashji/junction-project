"use client";

import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { ArrowUpDown, MessageSquare, ThumbsUp } from "lucide-react";
import { Input } from "~/components/ui/input";
import { ScrollArea } from "~/components/ui/scroll-area";
import { useRouter } from "next/navigation";
import Visitor from "./_components/visitor";
import Polls from "./_components/polls";

export default function Page() {
  return (
    <main className="container mx-auto p-4">
      <Visitor />
      <Polls />
    </main>
  );
}
