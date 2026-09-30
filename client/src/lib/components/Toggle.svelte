<script lang="ts">
  interface Props extends svelte.elements.HTMLInputAttributes {
    label: string;
    checked?: boolean;
  }

  import { generateUUID } from '$lib/utils';

  let { label, checked = $bindable(), class: extraClass = '', ...rest }: Props = $props();

  const id = `toggle-${generateUUID()}`;
</script>

<div class="flex items-center space-x-2 {extraClass}">
  <!-- The label for the toggle -->
  <label for={id} class="cursor-pointer select-none text-sm font-medium text-gray-900 dark:text-gray-300">{label}</label>

  <!-- The toggle switch. The checkbox is the `peer` and comes first in the DOM so the
       sibling combinator works on Safari < 15.4, which lacks :has(). The spans use
       pointer-events-none so clicks pass through to the input covering the track. -->
  <div class="relative inline-flex h-5 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full">
    <input type="checkbox" bind:checked {id} name={label} class="peer absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer appearance-none rounded-full focus:outline-none" aria-label={label} {...rest} />
    <!-- Background -->
    <span class="pointer-events-none absolute mx-auto h-4 w-9 rounded-full bg-gray-200 transition-colors duration-200 ease-in-out peer-checked:bg-blue-600 peer-focus:outline peer-focus:outline-2 peer-focus:outline-offset-2 peer-focus:outline-blue-500 dark:bg-gray-700 dark:peer-checked:bg-blue-500"></span>
    <!-- Knob -->
    <span class="pointer-events-none absolute left-0 size-5 rounded-full border border-gray-300 bg-white shadow transition-transform duration-200 ease-in-out peer-checked:translate-x-5 dark:border-gray-500 dark:bg-gray-300 dark:shadow-none"></span>
  </div>
</div>
