import type { Actions } from './$types';
import type { Profile } from './profile';
import OpenAI from 'openai';
import { OPENAI_API_KEY } from '$env/static/private';


export const actions = {
  generate: async ({ request }: { request: Request }): Promise<Actions> => {
    return { profile: {
      displayName: 'Ocean Lover',
      avatarImageUrl: 'https://oaidalleapiprodscus.blob.core.windows.net/private/org-7RjbIg1yIno2jYWlvj1nSKXD/user-X5jqXYgOmhyWPtWXGJlbXXsO/img-xuO5I3Ym5BaXGCsfXn1MwvNJ.png?st=2023-10-06T21%3A44%3A10Z&se=2023-10-06T23%3A44%3A10Z&sp=r&sv=2021-08-06&sr=b&rscd=inline&rsct=image/png&skoid=6aaadede-4fb3-4698-a8f6-684d7786b067&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2023-10-06T02%3A30%3A27Z&ske=2023-10-07T02%3A30%3A27Z&sks=b&skv=2021-08-06&sig=QqjUv7AVYbFsYoA6rteIm9WzJkthfORnkzuH%2B%2Bd7Wfw%3D',
      bio: 'Exploring the depths of the ocean and embracing the beauty of marine life 🌊🐠🐬 Dive in and join me on this aquatic adventure! 🐙🦈',
      bannerImageUrl: 'https://oaidalleapiprodscus.blob.core.windows.net/private/org-7RjbIg1yIno2jYWlvj1nSKXD/user-X5jqXYgOmhyWPtWXGJlbXXsO/img-Os8OudOBMrXmhslcaXxPVMax.png?st=2023-10-06T21%3A44%3A11Z&se=2023-10-06T23%3A44%3A11Z&sp=r&sv=2021-08-06&sr=b&rscd=inline&rsct=image/png&skoid=6aaadede-4fb3-4698-a8f6-684d7786b067&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2023-10-06T02%3A45%3A26Z&ske=2023-10-07T02%3A45%3A26Z&sks=b&skv=2021-08-06&sig=NpKKSm1jPn9hMf9/YyesdqTtxpWNzoSPWbAaJ5FYT00%3D',
      primaryColor: { r: 0, g: 119, b: 190 },
      secondaryColor: { r: 247, g: 192, b: 45 }
    }};

    // Initialize the connection to OpenAI
    const openai = new OpenAI({
      apiKey: OPENAI_API_KEY,
    });

    // Load and store the query
    const form = await request.formData();
    const prompt = form.get('prompt') as string;

    // Generate the summary
    const chatCompletion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a social media profile generator. You create visually interesting and thematic profiles based on users\' requests and interests. You are very good at your job.' },
        { role: 'user', content: 'Please make me a profile based on this prompt:' },
        { role: 'user', content: prompt },
      ],
      functions: [
        {
          name: 'generate_profile',
          description: 'Visualizes a user social media profile based on passed parameters.',
          parameters: {
            type: 'object',
            properties: {
              displayName: {
                type: 'string',
                description: 'The display name of the profile.',
              },
              avatarImagePrompt: {
                type: 'string',
                description: 'The prompt to generate the avatar image. Pass a prompt that describes what the image should look like, and the AI will generate that image.',
              },
              bio: {
                type: 'string',
                description: 'The bio of the profile.',
              },
              bannerImagePrompt: {
                type: 'string',
                description: 'The prompt to generate the banner image. Pass a prompt that describes what the image should look like, and the AI will generate that image.',
              },
              primaryColor: {
                type: 'object',
                description: 'The primary color of the profile, as RGB values from 0 to 255.',
                properties: {
                  r: {
                    type: 'integer',
                    description: 'The red value of the primary color.',
                  },
                  g: {
                    type: 'integer',
                    description: 'The green value of the primary color.',
                  },
                  b: {
                    type: 'integer',
                    description: 'The blue value of the primary color.',
                  },
                },
              },
              secondaryColor: {
                type: 'object',
                description: 'The secondary color of the profile, as RGB values from 0 to 255.',
                properties: {
                  r: {
                    type: 'integer',
                    description: 'The red value of the secondary color.',
                  },
                  g: {
                    type: 'integer',
                    description: 'The green value of the secondary color.',
                  },
                  b: {
                    type: 'integer',
                    description: 'The blue value of the secondary color.',
                  },
                },
              },
            },
            required: ['displayName', 'avatarImagePrompt', 'bio', 'bannerImagePrompt', 'primaryColor', 'secondaryColor'],
          }
        }
      ],
      function_call: { name: 'generate_profile' },
      model: 'gpt-3.5-turbo-0613',
    });

    if (chatCompletion.choices[0].message.function_call === undefined) {
      throw new Error('No function call returned from OpenAI.');
    }

    const functionCall: { name: string, arguments: string } = chatCompletion.choices[0].message.function_call;
    const calledArguments = JSON.parse(functionCall.arguments);

    console.log(calledArguments);

    // Generate the images
    const avatarImageCompletion = openai.images.generate({
      prompt: calledArguments.avatarImagePrompt,
      n: 1,
      response_format: 'url',
      size: '256x256',
    });
    const bannerImageCompletion = openai.images.generate({
      prompt: calledArguments.bannerImagePrompt,
      n: 1,
      response_format: 'url',
      size: '1024x1024',
    });

    // Generate the profile
    const profile: Profile = {
      displayName: calledArguments.displayName,
      avatarImageUrl: (await avatarImageCompletion).data[0].url as string,
      bio: calledArguments.bio,
      bannerImageUrl: (await bannerImageCompletion).data[0].url as string,
      primaryColor: calledArguments.primaryColor,
      secondaryColor: calledArguments.secondaryColor,
    };

    return { profile };
  }
} satisfies Actions;