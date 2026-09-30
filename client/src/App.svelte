<script lang="ts">
  import { setCastConsentProvider } from '$lib/cast';
  import CastConsentDialog from '$lib/components/CastConsentDialog.svelte';
  import ContactDialog from '$lib/components/ContactDialog.svelte';
  import CookieDialog from '$lib/components/CookieDialog.svelte';
  import Datenschutz from '$lib/components/Datenschutz.svelte';
  import Dialog from '$lib/components/Dialog.svelte';
  import DonateDialog from '$lib/components/DonateDialog.svelte';
  import Header from '$lib/components/Header.svelte';
  import HelpDialog from '$lib/components/HelpDialog.svelte';
  import Impressum from '$lib/components/Impressum.svelte';
  import ResultsContainer from '$lib/components/ResultsContainer.svelte';
  import RssFeedDialog from '$lib/components/RssFeedDialog.svelte';
  import SearchBar from '$lib/components/SearchBar.svelte';
  import { appState } from '$lib/store.svelte';
  import { initializeAnalytics, trackEvent } from '$lib/utils';
  import { onMount } from 'svelte';

  let cookieDialog: CookieDialog;
  let contactDialog: ContactDialog;
  let donateDialog: DonateDialog;
  let helpDialog: HelpDialog;
  let rssFeedDialog: RssFeedDialog;
  let castConsentDialog: CastConsentDialog;
  let mainElement: HTMLElement;
  let legalDialog = $state<Dialog>();

  let pageToView = $state<'datenschutz' | 'impressum' | null>(null);

  $effect(() => {
    const mainClassList = document.querySelector('main')?.classList;
    const navContainerClassList = document.querySelector('#nav-container')?.classList;
    if (mainClassList && navContainerClassList) {
      const isList = appState.viewMode === 'list';
      // Avoid classList.toggle(token, force) — its second argument is unreliable on
      // older Safari; add/remove is universally supported.
      for (const list of [mainClassList, navContainerClassList]) {
        list.add(isList ? 'max-w-screen-2xl' : 'max-w-7xl');
        list.remove(isList ? 'max-w-7xl' : 'max-w-screen-2xl');
      }
    }
  });

  $effect(() => {
    // Scroll to top when changing the pagination page. No-arg scrollIntoView (instant)
    // for iOS 12 — the ScrollIntoViewOptions object form isn't supported there.
    appState.currentPage;
    mainElement?.scrollIntoView();
  });

  $effect(() => {
    if (pageToView) {
      legalDialog?.show();
    } else {
      legalDialog?.close();
    }
  });

  function showImpressum() {
    pageToView = 'impressum';
  }

  function showDatenschutz() {
    pageToView = 'datenschutz';
  }

  onMount(() => {
    // Remove the browser warning now that JS is running
    document.getElementById('browserWarning')?.remove();

    initializeAnalytics();

    // This now correctly starts the reactive effects and returns a cleanup function
    const destroyStore = appState.init();

    setCastConsentProvider(
      () =>
        new Promise((resolve) => {
          castConsentDialog.show((choice) => {
            trackEvent('Cast Consent', { consent: choice });
            resolve(choice);
          });
        }),
    );

    // Cookie consent
    try {
      const allowCookies = localStorage.getItem('allowCookies');
      const lastAsked = parseInt(localStorage.getItem('allowCookiesAsked') || '0', 10);
      // Re-ask for consent after 7 days if it was denied previously.
      if (allowCookies === 'true') {
        addAdSense();
      } else if (allowCookies !== 'false' || isNaN(lastAsked) || lastAsked < Date.now() - 7 * 24 * 60 * 60 * 1000) {
        cookieDialog.show();
      }
    } catch (e) {
      console.warn('Could not access localStorage. Ads will not be shown.', e);
    }

    // This function will be called when the component is unmounted
    return () => {
      destroyStore();
    };
  });

  function addAdSense() {
    const adsense = document.createElement('script');
    adsense.type = 'text/javascript';
    adsense.setAttribute('data-ad-client', 'ca-pub-2430783446079517');
    adsense.async = true;
    adsense.crossOrigin = 'anonymous';
    adsense.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
    document.head.appendChild(adsense);
  }

  function handleCookieConsent(accepted: boolean) {
    trackEvent('Cookie Consent', { consent: accepted ? 'accept' : 'deny' });
    try {
      localStorage.setItem('allowCookies', String(accepted));
      localStorage.setItem('allowCookiesAsked', Date.now().toString());
    } catch (e) {
      /* ignore */
    }

    cookieDialog.close();

    if (accepted) {
      addAdSense();
    }
  }
</script>

<svelte:head>
  <title>{appState.query ? `${appState.query} – MediathekViewWeb` : 'MediathekViewWeb'}</title>
</svelte:head>

<div>
  <Header showContact={() => contactDialog.show()} showDonate={() => donateDialog.show()} showHelp={() => helpDialog.show()} {showImpressum} {showDatenschutz} />

  <main bind:this={mainElement} class="mx-auto py-6 px-4 sm:px-6 lg:px-8">
    <div>
      <SearchBar showHelp={() => helpDialog.show()} showRssFeed={() => rssFeedDialog.show()} />
      <ResultsContainer />
    </div>
  </main>
</div>

<CookieDialog bind:this={cookieDialog} onConsent={handleCookieConsent} {showImpressum} {showDatenschutz} />
<HelpDialog bind:this={helpDialog} />
<RssFeedDialog bind:this={rssFeedDialog} />
<CastConsentDialog bind:this={castConsentDialog} />
<ContactDialog bind:this={contactDialog} />
<DonateDialog bind:this={donateDialog} />

{#if pageToView}
  <Dialog bind:this={legalDialog} limitWidth={false} title={pageToView === 'impressum' ? 'Impressum' : 'Datenschutzerklärung'} icon={pageToView === 'impressum' ? 'person-lines-fill' : 'shield-shaded'} onclose={() => (pageToView = null)} class="max-w-4xl">
    <div class="max-h-[70vh] overflow-y-auto -mx-6 -my-8 md:-mx-8 p-6 md:p-8">
      {#if pageToView === 'impressum'}
        <Impressum />
      {:else if pageToView === 'datenschutz'}
        <Datenschutz />
      {/if}
    </div>
  </Dialog>
{/if}

