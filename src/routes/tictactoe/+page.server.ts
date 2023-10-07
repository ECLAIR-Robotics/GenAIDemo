import type { Actions } from './$types';
import OpenAI from 'openai';
import { OPENAI_API_KEY } from '$env/static/private';


export const actions = {
  play: async ({ request }: { request: Request }): Promise<Actions> => {
    // Initialize the connection to OpenAI
    const openai = new OpenAI({
      apiKey: OPENAI_API_KEY,
    });

    // Load and store the document
    const form = await request.formData();
    const spot = form.get('spot') as string;
    const coordinates = spot.split(',').map(s => parseInt(s)) as [number, number];
    const [i, j] = coordinates;
    const board = form.get('board') as string;
    let boardArray: string[] | string[][] = board.split(',').map(cell => cell === '' ? '_' : cell);
    boardArray = [
      boardArray.slice(0, 3),
      boardArray.slice(3, 6),
      boardArray.slice(6, 9),
    ]
    boardArray[i][j] = 'X';
    let boardString = boardArray.map(row => row.join('')).join('\n');

    let validMoves = [];
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (boardArray[i][j] === '_') {
          validMoves.push(`${i},${j}`);
        }
      }
    }

    // Generate the next move
    const chatCompletion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are an elite tic tac toe player. You must always win. You are very good at your job. You always play as O. Board states are represented by 3x3 grids with _ for empty spots.' },
        { role: 'user', content: 'Here is the board state:' },
        { role: 'user', content: boardString },
        { role: 'user', content: 'Here are your possible moves:' },
        { role: 'user', content: validMoves.join('\n') },
      ],
      functions: [
        {
          name: 'play_move',
          description: 'Play a move on the board. Must be on an empty spot.',
          parameters: {
            type: 'object',
            properties: {
              position: {
                type: 'string',
                description: 'The position to play, represented by integers y,x. y represents the y position starting from top and x represents the x position starting from left. Only play valid moves.',
                enum: validMoves,
              },
            },
            required: ['position'],
          },
        }
      ],
      function_call: { name: 'play_move' },
      model: 'gpt-3.5-turbo-0613',
    });

    if (chatCompletion.choices[0].message.function_call === undefined) {
      throw new Error('No function call returned from OpenAI.');
    }

    const functionCall: { name: string, arguments: string } = chatCompletion.choices[0].message.function_call;
    const calledArguments = JSON.parse(functionCall.arguments);
    let y, x;
    if (validMoves.includes(calledArguments.position)) {
      [y, x] = calledArguments.position.split(',').map(s => parseInt(s)) as [number, number];
    } else {  // Pick a random move if GPT did not pick a valid one
      console.log(`GPT did not pick a valid move: ${calledArguments.position}`);
      [y, x] = validMoves[Math.floor(Math.random() * validMoves.length)].split(',').map(s => parseInt(s)) as [number, number];
    }

    return { x, y };
  }
} satisfies Actions;