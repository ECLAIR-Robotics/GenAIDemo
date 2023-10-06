<script lang="ts">
	import { enhance } from '$app/forms';
	let document: string = '';
	let loading: boolean = false;
	let summary: string = '';
	let error: boolean = false;
</script>

<style lang="postcss">
  h1 {
    @apply text-2xl font-bold text-black dark:text-white;
  }

  h2 {
    @apply text-xl font-bold text-black dark:text-white;
  }

  article {
    @apply text-center w-full
  }

  p {
    @apply text-black dark:text-white;
  }

  textarea {
    @apply w-1/2 h-48 p-4 rounded border-2 border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-black dark:text-white focus:border-black/20 focus:dark:border-white/20 focus:outline-none;
  }

  button {
    @apply bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 text-black dark:text-white font-bold p-8 rounded;
  }
</style>

<div class="w-full p-6 flex flex-col justify-center items-center space-y-6">
	<h1>Summarize your document!</h1>
	<form
		action="?/summarize"
		method="post"
    class="w-full flex flex-col justify-center items-center space-y-6"
		use:enhance={({ form, data, action, cancel, submitter }) => {
			loading = true;
			return async ({ result, update }) => {
				if (result.status === 200 && result.type == "success" && result?.data?.summary) {
					summary = result.data.summary;
					error = false;
				} else {
					error = true;
				}
				loading = false;
			};
		}}
	>
		<textarea bind:value={document} placeholder="Paste your document here..."></textarea>
		<input type="hidden" value={document} name="document" />
		<button aria-busy={loading} type="submit">{loading ? 'Please Wait...' : 'Summarize'}</button>
	</form>

	{#if !loading && summary}
		<article>
			<h2>Summary</h2>
			<p>{summary}</p>
		</article>
	{/if}

	{#if error}
		<p>There was an error processing your request. Please try again.</p>
	{/if}
</div>
