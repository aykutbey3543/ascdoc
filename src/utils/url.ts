export async function checkUrlReachability(url: string, timeoutMs: number = 5000): Promise<{ reachable: boolean; error?: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    // Try HEAD first
    let response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    if (response.status === 405 || response.status === 403) {
      // Some servers reject HEAD requests or generic fetches, fallback to GET
      response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
        headers: {
           'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
      });
    }

    clearTimeout(timeoutId);

    if (response.ok || (response.status >= 300 && response.status < 400)) {
      return { reachable: true };
    } else {
      return { reachable: false, error: `HTTP ${response.status} ${response.statusText}` };
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return { reachable: false, error: 'Connection timed out' };
    }
    return { reachable: false, error: error.message || 'Unknown network error' };
  }
}
