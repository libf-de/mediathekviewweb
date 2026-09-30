<script lang="ts">
  import { slide } from 'svelte/transition';

  let { isOpen, children } = $props<{
    isOpen: boolean;
    children: svelte.Snippet;
  }>();
</script>

{#if isOpen}
  <div transition:slide={{ duration: 250 }}>
    {@render children()}
  </div>
{/if}
