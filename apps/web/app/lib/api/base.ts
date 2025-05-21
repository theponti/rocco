import { QueryClient } from "@tanstack/react-query";
import axios from "axios";

export const baseURL = import.meta.env.VITE_API_URL;

// Cache times in milliseconds
export const CACHE_TIME = {
	SHORT: 1000 * 60 * 5, // 5 minutes
	MEDIUM: 1000 * 60 * 30, // 30 minutes
	LONG: 1000 * 60 * 60 * 24, // 24 hours
};

// Token provider for authentication
let tokenProvider: (() => Promise<string | null>) | null = null;

export const setTokenProvider = (provider: () => Promise<string | null>) => {
	tokenProvider = provider;
};

export const getToken = async (): Promise<string | null> => {
	if (tokenProvider) {
		return tokenProvider();
	}
	return null;
};

// Create optimized QueryClient with better caching defaults
export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			// General settings
			retry: 1, // Only retry once
			retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000), // Exponential backoff
			staleTime: CACHE_TIME.SHORT, // Consider data stale after 5 minutes
			gcTime: CACHE_TIME.MEDIUM, // Keep unused data in cache for 30 minutes
			refetchOnWindowFocus: import.meta.env.PROD, // Only refetch on window focus in production
			refetchOnMount: true, // Refetch when component mounts
			refetchOnReconnect: true, // Refetch when reconnecting

			// Performance optimizations
			structuralSharing: true, // Compare data structurally to avoid unnecessary rerenders
		},
		mutations: {
			retry: 1, // Only retry mutations once
			retryDelay: 1000, // 1 second delay between retries
		},
	},
});

// Create Axios client with optimized settings
export const api = axios.create({
	baseURL,
	withCredentials: true,
	timeout: 10000, // 10 second timeout
	headers: {
		"Content-Type": "application/json",
		Accept: "application/json",
	},
});

// Add interceptors for performance monitoring and caching
api.interceptors.request.use(async (config) => {
	// Set request start time for performance tracking
	config.headers.metadata = { startTime: Date.now() };

	// Add auth token to request if available
	try {
		// For client-side requests, get the token from the provider
		if (typeof window !== "undefined") {
			const token = await getToken();
			console.log("Token:", token);
			if (token) {
				config.headers.Authorization = `Bearer ${token}`;
			}
		}
	} catch (error) {
		console.error("Error adding auth token to request:", error);
	}

	return config;
});

api.interceptors.response.use(
	(response) => {
		// Log API request duration if in development
		if (import.meta.env.DEV && response.headers.metadata) {
			const duration = Date.now() - response.headers.metadata.startTime;
			console.log(`API call to ${response.config.url} took ${duration}ms`);
		}
		return response;
	},
	(error) => {
		// Handle common errors here
		return Promise.reject(error);
	},
);

// Query key factory functions
export const queryKeys = {
	lists: {
		all: ["lists"] as const,
		detail: (id: string) => ["lists", id] as const,
		items: (id: string) => ["lists", id, "items"] as const,
	},
	places: {
		all: ["places"] as const,
		detail: (id: string) => ["places", id] as const,
		search: (query: string, location: any) =>
			["places", "search", query, location] as const,
	},
	invites: {
		all: ["invites"] as const,
		outbound: ["invites", "outbound"] as const,
		list: (id: string) => ["invites", "list", id] as const,
	},
};

export const URLS = {
	lists: `${baseURL}/lists`,
	places: `${baseURL}/places`,
	invites: `${baseURL}/invites`,
};
