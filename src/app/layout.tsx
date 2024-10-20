import React from 'react';
import ClientLayout from './clientLayout';
import "./globals.css";

export const metadata = {
  title: 'GitHub Repository Analyzer',
  description: 'Analyze GitHub repositories with AI-powered insights',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}