import type { Metadata } from 'next';
import '@/styles/tokens.css';
export const metadata: Metadata = { title: 'LUX Blinds — Base', description: 'Shared application foundation' };
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en"><body>{children}</body></html>}
