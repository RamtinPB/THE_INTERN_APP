import type { AppProps } from "next/app";
import type { NextPage } from "next";
import { AuthBootstrap } from "@/components/AuthBootstrap";
import { ReactElement, ReactNode } from "react";
import "@/globals.css";
import { Baloo_Bhaijaan_2 } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";

const balooBhaijaan = Baloo_Bhaijaan_2({
	subsets: ["arabic", "latin"],
	weight: ["400", "500", "600", "700", "800"],
});

export default function App({ Component, pageProps }: AppProps) {
	const ComponentWithLayout = Component as NextPageWithLayout;
	const getLayout =
		ComponentWithLayout.getLayout || ((page: ReactNode) => page);

	return (
		<AuthBootstrap>
			<div className={balooBhaijaan.className}>
				{getLayout(<Component {...pageProps} />)}
				<Toaster />
			</div>
		</AuthBootstrap>
	);
}

type NextPageWithLayout = NextPage & {
	getLayout?: (page: ReactElement) => ReactElement;
};
