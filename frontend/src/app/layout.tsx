import '@/styles/globals.css';
import { Inter, Poppins } from 'next/font/google';
import { Providers } from './providers';
import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: 'LlévateloExpress - Financiamiento de Vehículos en Venezuela',
  description: 'Plataforma de financiamiento y adquisición de motocicletas, vehículos, camiones y maquinaria agrícola en Venezuela.',
  keywords: 'financiamiento, vehículos, motocicletas, maquinaria agrícola, Venezuela, crédito',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.variable} ${poppins.variable}`}>
      <body>
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
} 