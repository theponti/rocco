import { useAuth } from "@clerk/react-router";
import { redirect } from "react-router";

/**
 * Type definitions for loader/action arguments
 */
export interface LoaderArgs {
  params: Record<string, string>;
  request: Request;
}

/**
 * Error response for data loaders
 */
export class LoaderError extends Error {
  status: number;
  
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

/**
 * Helper to create a clientLoader with auth check
 * @param loaderFn The function to run after auth check
 */
export function createProtectedClientLoader<T>(
  loaderFn: (args: LoaderArgs & { userId: string }) => Promise<T>
) {
  return async (args: LoaderArgs) => {
    const { userId } = useAuth();
    
    if (!userId) {
      throw redirect("/login");
    }
    
    try {
      return await loaderFn({ ...args, userId });
    } catch (error) {
      if (error instanceof LoaderError) {
        throw new Response(error.message, { status: error.status });
      }
      throw new Response("An unexpected error occurred", { status: 500 });
    }
  };
}

/**
 * Helper to handle async loader errors
 */
export async function handleLoaderData<T>(
  promise: Promise<T>,
  errorMessage = "Failed to load data"
): Promise<T> {
  try {
    return await promise;
  } catch (error) {
    console.error("Loader error:", error);
    throw new LoaderError(errorMessage);
  }
}