"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

export default function AboutPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">About</h2>
        <p className="text-muted-foreground">
          Learn more about our platform and features.
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>What is this platform?</CardTitle>
            <CardDescription>
              Understanding our services and features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="prose prose-sm">
              <p>
                This platform allows users to participate in polls and
                discussions while maintaining their privacy through secure
                identity verification.
              </p>
              <h3 className="mt-4 text-lg font-semibold">Features</h3>
              <ul className="list-disc space-y-2 pl-4">
                <li>Secure identity verification</li>
                <li>Anonymous voting</li>
                <li>Community discussions</li>
                <li>Real-time updates</li>
              </ul>
              <h3 className="mt-4 text-lg font-semibold">Privacy</h3>
              <p>
                We take your privacy seriously. Your identity is protected
                through advanced cryptographic methods, and your personal
                information is never shared without your explicit consent.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Version Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-sm font-medium text-muted-foreground">
                Version
              </div>
              <div className="text-sm">1.0.0</div>
              <div className="text-sm font-medium text-muted-foreground">
                Last Updated
              </div>
              <div className="text-sm">March 2024</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
