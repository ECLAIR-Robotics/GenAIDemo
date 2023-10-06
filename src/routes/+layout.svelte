<script>
  import "../app.css";
  import Header from "./header.svelte";
</script>

<div class="bg-rose-50 dark:bg-[#180208] h-screen overflow-y-auto">
  <Header />
  <slot />
</div>