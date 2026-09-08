import { Fraunces, Karla } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "500", "600"],
});

const karla = Karla({
  subsets: ["latin"],
  variable: "--font-karla",
  weight: ["400", "500", "700"],
});

export const metadata = {
  title: "Béb Eco — Occasion entre parents",
  description:
    "Achetez et vendez des articles de bébé et d'enfant d'occasion entre particuliers.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body
        className={`${fraunces.variable} ${karla.variable} font-body bg-ivory min-h-screen pb-20`}
      >
        <div className="max-w-md mx-auto min-h-screen bg-ivory relative">
          {children}
          <Nav />
        </div>
      </body>
    </html>
  );
}
