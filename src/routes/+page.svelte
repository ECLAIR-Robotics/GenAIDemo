<script lang="ts">
  let pages: { name: string, url: string }[] = [
    { name: "Four Approaches to build on top of Generative AI Foundational Models", url: "https://towardsdatascience.com/four-approaches-to-build-on-top-of-generative-ai-foundational-models-43c1a64cffd5" },
    { name: "A Very Gentle Introduction to Large Language Models without the Hype", url: "https://mark-riedl.medium.com/a-very-gentle-introduction-to-large-language-models-without-the-hype-5f67941fa59e" },
    { name: "Introduction to Generative AI Learning Path", url: "https://www.cloudskillsboost.google/journeys/118" },
    { name: "OpenAI API", url: "https://platform.openai.com/docs/introduction" },
    { name: "Anthropic API", url: "https://docs.anthropic.com/claude/reference/getting-started-with-the-api" },
    { name: "What is Retrieval-Augmented Generation?", url: "https://www.youtube.com/watch?v=T-D1OfcDW1M" },
    { name: "The Illustrated Transformer", url: "http://jalammar.github.io/illustrated-transformer/" },
    { name: "LLM Powered Autonomous Agents", url: "https://lilianweng.github.io/posts/2023-06-23-agent/" },
  ];
</script>

<style lang="postcss">
  a {
    @apply text-blue-600 dark:text-blue-500 hover:underline visited:text-purple-600 dark:visited:text-purple-500;
  }
</style>

<div class="w-full p-6 text-black dark:text-white text-2xl">
  <p>Hello! This demo seeks to show you what it is possible to build on top of LLMs and how to do so. Feel free to check out any of the examples above!</p>
  <p>Here are some more resources related to building with Generative AI, what LLMs are, and how they work:</p>
  <ul class="list-disc list-inside">
    {#each pages as page}
      <li>
        <a href={page.url}>{page.name}</a>
      </li>
    {/each}
  </ul>
  <p>Happy hacking!</p>
</div>
