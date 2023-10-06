<script lang="ts">
	import { enhance } from '$app/forms';
	let document: string = '';
	let status: 'waiting' | 'loading' | 'success' | 'error' = 'waiting';
</script>

<style lang="postcss">
  h1 {
    @apply text-2xl font-bold text-black dark:text-white;
  }

  h2 {
    @apply text-xl font-bold text-black dark:text-white;
  }

  article {
    @apply text-center
  }

  p {
    @apply text-black dark:text-white;
  }

  textarea {
    @apply w-1/2 h-48 p-4 rounded-l border-2 border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-black dark:text-white;
  }

  button {
    @apply bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 text-black dark:text-white font-bold p-8 rounded-2xl;
  }
</style>

<div class="w-full p-6 flex flex-col justify-center items-center space-y-6">
	<h1>Chat with your long-form document!</h1>
	<form
		action="?/processDocument"
		method="post"
    class="w-full flex flex-col justify-center items-center space-y-6"
		use:enhance={({ form, data, action, cancel, submitter }) => {
			status = 'loading';
			return async ({ result, update }) => {
				if (result.status === 200 && result.type == "success") {
					status = 'success';
				} else {
					status = 'error';
				}
			};
		}}
	>
		<textarea bind:value={document} placeholder="Paste your document here..."></textarea>
		<input type="hidden" value={document} name="document" />
		<button aria-busy={status == 'loading'} type="submit">{status == 'loading' ? 'Please Wait...' : 'Chat'}</button>
	</form>

	{#if status == 'success'}
		<article>
      <h2>Chat</h2>
			<p>{status}</p>
		</article>
	{/if}

	{#if status == 'error'}
		<p>There was an error processing your request. Please try again.</p>
	{/if}
</div>
