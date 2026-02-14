import type { AppProps } from "next/app";
import { AuthBootstrap } from "@/components/AuthBootstrap";
import { ReactElement, ReactNode } from "react";
import "@/app/globals.css";

export default function App({ Component, pageProps }: AppProps) {
	const ComponentWithLayout = Component as NextPageWithLayout;
	const getLayout =
		ComponentWithLayout.getLayout || ((page: ReactNode) => page);

	return (
		<AuthBootstrap>{getLayout(<Component {...pageProps} />)}</AuthBootstrap>
	);
}

type NextPageWithLayout = {
	getLayout?: (page: ReactElement) => ReactElement;
};
