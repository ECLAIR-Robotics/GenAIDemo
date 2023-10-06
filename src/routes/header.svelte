<script lang="ts">
  import { goto } from "$app/navigation";

  let pages: { name: string, url: string }[] = [
    { name: "Home", url: "/" },
    { name: "Summarize Text Document", url: "/summarize" },
    { name: "Text Document Chat", url: "/documentchat" },
    { name: "Generate Profile", url: "/generateprofile" },
  ];
</script>

<style lang="postcss">
  button {
    @apply bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 text-black dark:text-white font-bold py-8 px-6
  }
</style>

<div class="w-full bg-rose-100 dark:bg-rose-950 px-6">
  <div class="flex flex-row justify-between items-center">
    <div class="flex flex-row items-center">
      <h1 class="text-2xl font-bold text-rose-900 dark:text-rose-50 mr-6">Generative AI Demo</h1>
      {#each pages as page}
        <button on:click={() => goto(page.url)}>{page.name}</button>
      {/each}
    </div>
    <h2 class="text-xl font-bold text-black dark:text-white">
      <span class="inline bg-gradient-to-r from-indigo-500 to-fuchsia-500 bg-clip-text text-transparent">ECLAIR</span>
      2023
    </h2>
  </div>
</div>