import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Fetch with a timeout
 * @param resource The resource to fetch
 * @param options Fetch options including timeout in milliseconds
 * @returns Promise<Response>
 */
export async function fetchWithTimeout(
  resource: string | Request,
  options: RequestInit & { timeout?: number } = {}
): Promise<Response> {
  const { timeout = 30000 } = options; // Default 30 seconds

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeout}ms`);
    }
    throw error;
  }
}
