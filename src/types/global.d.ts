export {};

declare global {
  interface Window {
    /**
     * Schedules a function to run during a browser's idle periods.
     */
    requestIdleCallback?: (callback: () => void, options?: { timeout?: number }) => number;
  }

  interface Document {
    /**
     * The FontFaceSet interface represents the set of fonts available to the document.
     */
    fonts: FontFaceSet;
  }
}
