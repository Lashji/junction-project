"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { Alert, AlertDescription } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  Fingerprint,
  Globe2,
  KeyRound,
  LockKeyhole,
  LucideGlobe,
  Smartphone,
  Users,
} from "lucide-react";

export default function SetupPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const error_description = searchParams.get("error_description");

  useEffect(() => {
    if (error) {
      console.error("Login error:", error_description);
    }
  }, [error, error_description]);

  const handleLogin = async () => {
    try {
      const response = await fetch("/api/auth/sign-in", {
        method: "POST",
      });
      const { url } = (await response.json()) as { url: string };
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error("Failed to initialize authentication:", error);
    }
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <div className="flex flex-1 flex-col bg-foreground/95 px-16 py-20 text-primary-foreground">
        <div className="flex-1">
          <LucideGlobe className="mb-16 h-16 w-16 text-background" />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-24"
          >
            <h1 className="mb-6 text-5xl font-bold leading-tight md:text-6xl">
              Welcome to Quorum
            </h1>
            <p className="text-xl text-primary-foreground/80">
              Digital democracy at your fingertips
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-12"
          >
            <h2 className="text-lg font-medium">How it works</h2>
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-primary-foreground/10 p-2.5">
                  <Globe2 className="h-6 w-6 text-primary-foreground/80" />
                </div>
                <div>
                  <h3 className="mb-2 font-medium text-primary-foreground">
                    1. Secure Identity Verification
                  </h3>
                  <p className="text-sm leading-relaxed text-primary-foreground/70">
                    To ensure one-person-one-vote integrity, we use bank
                    verification to create your digital identity. This one-time
                    process is secure, and all data remains encrypted on your
                    device only.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="rounded-full bg-primary-foreground/10 p-2.5">
                  <LockKeyhole className="h-6 w-6 text-primary-foreground/80" />
                </div>
                <div>
                  <h3 className="mb-2 font-medium text-primary-foreground">
                    2. Complete Privacy Control
                  </h3>
                  <p className="text-sm leading-relaxed text-primary-foreground/70">
                    Your identity proof lives only on your device. Using
                    zero-knowledge technology, you can prove your uniqueness
                    without ever sharing personal data with anyone, including
                    us.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="rounded-full bg-primary-foreground/10 p-2.5">
                  <Users className="h-6 w-6 text-primary-foreground/80" />
                </div>
                <div>
                  <h3 className="mb-2 font-medium text-primary-foreground">
                    3. True Digital Democracy
                  </h3>
                  <p className="text-sm leading-relaxed text-primary-foreground/70">
                    Participate in online communities with guaranteed anonymity
                    while proving you&apos;re a unique human. This eliminates
                    bots and duplicate accounts, ensuring authentic democratic
                    participation.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="mt-auto pt-20 text-sm text-primary-foreground/60">
          <p>© 2024 Quorum. All rights reserved.</p>
        </div>
      </div>

      {/* Right side - Login */}
      <div className="bg-dot-pattern flex flex-1 flex-col items-center justify-center px-16 py-20">
        <div className="w-full max-w-[400px] space-y-10">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error_description ?? "An error occurred during verification"}
              </AlertDescription>
            </Alert>
          )}

          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8 flex justify-center"
            >
              <div className="relative">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary/20 to-primary/40 blur-md" />
                <div className="relative rounded-full bg-background p-4">
                  <KeyRound className="h-8 w-8 text-primary" />
                </div>
              </div>
            </motion.div>
            <h2 className="mb-3 text-2xl font-semibold">Get Started</h2>
            <p className="text-muted-foreground">
              Create your digital identity using secure bank verification. Your
              data stays under your control.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Button
              onClick={handleLogin}
              size="lg"
              className="w-full py-6 text-lg"
            >
              Verify with Bank ID
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>

          <p className="text-center text-sm text-muted-foreground">
            By continuing, you agree to our{" "}
            <Link href="/terms" className="underline hover:text-primary">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline hover:text-primary">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
