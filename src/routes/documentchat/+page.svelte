<script lang="ts">
	import { enhance } from '$app/forms';
	let document: string = '';
	let status: 'waiting' | 'loading' | 'success' | 'error' = 'waiting';
  let chatStatus: 'loading' | 'success' | 'error' = 'success';
  let chat: string = '';
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
    @apply bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 text-black dark:text-white font-bold;
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
          chat = '';
				} else {
					status = 'error';
				}
			};
		}}
	>
		<textarea bind:value={document} placeholder="Paste your document here..."></textarea>
		<input type="hidden" value={document} name="document" />
		<button aria-busy={status == 'loading'} type="submit" class="p-8 rounded-lg">{status == 'loading' ? 'Please Wait...' : 'Chat'}</button>
	</form>

	{#if status == 'success'}
		<article>
      <h2>Chat</h2>
      <form
        action="?/chat"
        method="post"
        class="w-1/2 flex items-center space-x-4 ml-auto"
        use:enhance={({ form, data, action, cancel, submitter }) => {
          chatStatus = 'loading';
          return async ({ result, update }) => {
            console.log(result);
            if (result.status === 200 && result.type == "success") {
              chatStatus = 'success';
              chat = result.data.response;
            } else {
              chatStatus = 'error';
            }
          };
        }}
      >
        <input type="text" name="message" class="w-1/2 ml-[-25%] rounded-sm border-2 border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-black dark:text-white focus:border-black/20 focus:dark:border-white/20 focus:outline-none" />
        <button aria-busy={chatStatus == 'loading'} type="submit" class="p-2 rounded">{chatStatus == 'loading' ? 'Please Wait...' : 'Send'}</button>
      </form>
      <p>{chat}</p>
		</article>
	{/if}

	{#if status == 'error'}
		<p>There was an error processing your request. Please try again.</p>
	{/if}
</div>
