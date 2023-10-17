<script lang="ts">
	import { enhance } from '$app/forms';
  import { io } from 'socket.io-client'

  const socket = io()
  let world: number[][] = [];

  socket.on('update', (message) => {
    const {new_world, new_players} = message;

    console.log(new_world);
    world = new_world;
  })
</script>

<style lang="postcss">
  h1 {
    @apply text-2xl font-bold text-black dark:text-white;
  }

  h2 {
    @apply text-9xl font-bold text-black dark:text-white;
  }

  p {
    @apply text-black dark:text-white;
  }

  button {
    @apply bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 text-black dark:text-white font-bold p-8 rounded;
  }
</style>

<div class="w-full p-6 flex flex-col justify-center items-center space-y-6">
	<h1>Interact with ChatGPT!</h1>
  {#each world as row}
    <div class="flex flex-row space-x-6">
      {#each row as cell}
        {#if cell == 0}
          <div class="w-6 h-6 bg-black/5 dark:bg-white/5 rounded"></div>
        {:else if cell == 1}
          <div class="w-6 h-6 bg-black/50 dark:bg-white/50 rounded"></div>
        {/if}
      {/each}
    </div>
  {/each}
</div>
