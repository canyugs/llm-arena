import { useState, useCallback } from 'react';
import { toPng } from 'html-to-image';

export const useScreenshot = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const takeScreenshot = useCallback(async (element: HTMLElement) => {
    if (!element) {
      const err = new Error('Screenshot target element not found');
      setError(err.message);
      throw err;
    }

    setLoading(true);
    setError(null);

    try {
      const options = {
        // Use device pixel ratio for better quality on high-res screens (mobile)
        pixelRatio: window.devicePixelRatio || 2,
        // Ensure all content is captured by using scroll dimensions
        width: element.scrollWidth,
        height: element.scrollHeight,
        // A fix for some images not loading
        cacheBust: true,
      };

      const dataUrl = await toPng(element, options);
      return dataUrl;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Screenshot failed:', err);
      throw err; // Re-throw to be caught in the component
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, takeScreenshot };
};
