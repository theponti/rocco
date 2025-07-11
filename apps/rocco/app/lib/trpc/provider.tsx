import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { useState } from "react";
import { supabase } from "../supabase";
import { trpc } from "./client";

export function TRPCProvider({ children }: { children: React.ReactNode }) {
	const [queryClient] = useState(() => new QueryClient());
	const [trpcClient] = useState(() =>
		trpc.createClient({
			links: [
				httpBatchLink({
					url: "/api/trpc",
					// Include authentication headers
					async headers() {
						const { data: { session } } = await supabase.auth.getSession();
						
						return {
							authorization: session?.access_token 
								? `Bearer ${session.access_token}` 
								: '',
						};
					},
				}),
			],
		})
	);

	return (
		<trpc.Provider client={trpcClient} queryClient={queryClient}>
			<QueryClientProvider client={queryClient}>
				{children}
			</QueryClientProvider>
		</trpc.Provider>
	);
} 