// Legacy-browser runtime shims. Imported first from main.ts so they run before any
// application code (including Svelte component setup) executes.

const mqlProto = typeof MediaQueryList != 'undefined' ? MediaQueryList.prototype : undefined;

// iOS/Safari < 14 lack MediaQueryList.addEventListener (only deprecated addListener
// exists); Svelte's `MediaQuery` uses addEventListener, so alias it to the legacy API.
if (mqlProto && typeof mqlProto.addEventListener != 'function') {
  (mqlProto as any).addEventListener = function (this: MediaQueryList, _type: string, listener: (ev: MediaQueryListEvent) => void): void {
    this.addListener(listener);
  };
  (mqlProto as any).removeEventListener = function (this: MediaQueryList, _type: string, listener: (ev: MediaQueryListEvent) => void): void {
    this.removeListener(listener);
  };
}
