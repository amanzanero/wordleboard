import "../styles/globals.css";
import type { AppProps } from "next/app";
import { QueryClient, QueryClientProvider } from "react-query";
import { UserProvider } from "../library/auth";

const queryClient = new QueryClient();
function MyApp({ Component, pageProps }: AppProps) {
  return (
    <UserProvider>
      <QueryClientProvider client={queryClient}>
        <Component {...pageProps} />
      </QueryClientProvider>
    </UserProvider>
  );
}

export default MyApp;
