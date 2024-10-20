'use client';

import React from 'react';
import { ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import { QueryClient, QueryClientProvider } from 'react-query';
import theme from '../styles/theme';

// Create a client
const queryClient = new QueryClient();

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </QueryClientProvider>
    );
}