<script lang="ts">
	import { enhance } from '$app/forms';
	import type { Profile } from './profile';
	let status: 'waiting' | 'loading' | 'success' | 'error' = 'waiting';
  let profile: Profile | undefined = undefined;

  function componentToHex(c: number) {
    c = Math.floor(Math.min(255, Math.max(0, c)))
    var hex = c.toString(16)
    return hex.length == 1 ? "0" + hex : hex;
  }

  function rgbToHex(r: number, g: number, b: number) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
  }

  const BG_DIM = 0.25

  $: primaryColor = profile == undefined ? '' : rgbToHex(profile.primaryColor.r, profile.primaryColor.g, profile.primaryColor.b)
  $: secondaryColor = profile == undefined ? '' : rgbToHex(profile.secondaryColor.r, profile.secondaryColor.g, profile.secondaryColor.b)
  $: backgroundColor = profile == undefined ? '' : rgbToHex(profile.primaryColor.r * BG_DIM, profile.primaryColor.g * BG_DIM, profile.primaryColor.b * BG_DIM)
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

  button {
    @apply bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 text-black dark:text-white font-bold p-6 rounded;
  }
</style>

<div class="w-full p-6 flex flex-col justify-center items-center space-y-6">
	<h1>Generate a profile!</h1>
	<form
		action="?/generate"
		method="post"
    class="w-full flex flex-col justify-center items-center space-y-6"
		use:enhance={({ form, data, action, cancel, submitter }) => {
			status = 'loading';
			return async ({ result, update }) => {
				if (result.status === 200 && result.type == "success") {
					profile = result.data.profile;
					status = 'success';
				} else {
					status = 'error'
				}
			};
		}}
	>
    <input type="text" name="prompt" class="w-3/4 rounded-sm border-2 border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-black dark:text-white focus:border-black/20 focus:dark:border-white/20 focus:outline-none" />
    <button aria-busy={status == 'loading'} type="submit">{status == 'loading' ? 'Please Wait...' : 'Generate'}</button>
	</form>

	{#if status == 'success' && profile}
		<article>
			<h2>Generated Profile</h2>
      <div class="w-full flex flex-col justify-center items-center mt-4">
        <div class="w-1/4 rounded-xl p-1" style="background: linear-gradient({primaryColor}, {secondaryColor});">
          <div class="w-full flex flex-col justify-center items-center pb-4 rounded-xl" style="background: {backgroundColor};">
            <div class="w-full h-32 relative overflow-hidden rounded-t-lg">
              <img alt="banner" src={profile.bannerImageUrl} class="w-full h-full object-cover object-center" />
            </div>
            <div class="flex flex-row items-center w-full h-16 ml-20 mt-[-1em] mb-2 z-10 space-x-4">
              <img alt="avatar" src={profile.avatarImageUrl} class="h-full rounded-full border-2" style="border-color: {primaryColor}" />
              <h2>{profile.displayName}</h2>
            </div>
            <p class="p-4 text-left">{profile.bio}</p>
          </div>
        </div>
      </div>
		</article>
	{/if}

	{#if status == 'error'}
		<p>There was an error processing your request. Please try again.</p>
	{/if}
</div>
