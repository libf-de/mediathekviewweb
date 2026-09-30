<script lang="ts">
  import type { Snippet } from 'svelte';
  import { fade } from 'svelte/transition';
  import Icon from './Icon.svelte';

  interface Props {
    children: Snippet;
    title?: string;
    icon?: string;
    limitWidth?: boolean;
    closeOnClickOutside?: boolean;
    onclose?: () => void;
    class?: string;
  }

  let { children, title, icon, onclose, class: extraClass = '', limitWidth = true, closeOnClickOutside = false }: Props = $props();

  // Custom overlay instead of the native <dialog> element, which is unsupported on
  // iOS/Safari < 15.4 (there it renders as an always-visible inline block).
  let open = $state(false);
  let panel = $state<HTMLDivElement>();

  export function show() {
    open = true;
  }

  export function close() {
    if (!open) return;
    open = false;
    onclose?.();
  }

  function onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
    }
  }

  // Lock background scroll and move focus into the dialog while it is open.
  $effect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panel?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  });
</script>

<svelte:window onkeydown={open ? onKeydown : undefined} />

{#if open}
  <div class="modal-backdrop" transition:fade={{ duration: 150 }}>
    <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
    <div
      class="modal-centerer"
      role="presentation"
      onclick={(event) => {
        if (closeOnClickOutside && event.target === event.currentTarget) close();
      }}>
      <div
        bind:this={panel}
        tabindex="-1"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        class:max-w-xl={limitWidth}
        class:md:max-w-2xl={limitWidth}
        class="modal-panel w-full rounded-2xl bg-white p-0 shadow-lg dark:bg-gray-800 text-gray-900 dark:text-gray-50 {extraClass}">
        {#if title}
          <div class="flex items-center justify-between p-6 md:p-8">
            <div class="flex items-center space-x-4">
              {#if icon}
                <Icon {icon} class="text-2xl " />
              {/if}
              <h2 class="text-2xl font-semibold">{title}</h2>
            </div>

            <button type="button" onclick={close} class="text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-50 cursor-pointer" aria-label="Schließen">
              <Icon icon="x-lg" size="lg" />
            </button>
          </div>
        {/if}
        <div class="p-6 md:p-8 pt-0 md:pt-0">
          {@render children()}
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 50;
    overflow-y: auto;
    background-color: rgba(0, 0, 0, 0.5);
  }

  /* min-height (not height) keeps short dialogs centered while letting tall ones grow
     and scroll the backdrop, avoiding the flex-centering top-clipping bug. */
  .modal-centerer {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100%;
    padding: 1rem;
  }

  .modal-panel {
    outline: none;
  }
</style>
