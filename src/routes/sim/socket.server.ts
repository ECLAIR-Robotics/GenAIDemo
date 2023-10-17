
import { type ViteDevServer } from 'vite'
import { Server } from 'socket.io'
import dotenv from 'dotenv'
import OpenAI from 'openai';

dotenv.config()

const TILE_TYPES = ['empty', 'wall']
const WORLD_SIZE = [6, 6]
const TICK_RATE = 1000
const CHATGPT_ID = 'chatgpt'
const CHATGPT_NAME = 'ChatGPT'
const HOME_NAME = 'Home'
const DIRECTIONS = {
  up: [0, -1],
  down: [0, 1],
  left: [-1, 0],
  right: [1, 0],
};
const START_LOCATION = [0, 0];
const HOME_LOCATION = [5, 5];
const MESSAGE_PERSISTENCE = 5;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const world = [
  [0, 0, 0, 0, 0, 0],
  [0, 1, 1, 0, 1, 0],
  [0, 1, 0, 0, 1, 0],
  [0, 1, 1, 0, 1, 0],
  [0, 0, 1, 0, 1, 0],
  [0, 0, 1, 0, 0, 0],
]
const players: { [id: string]: { name: string, message_history: string[], current_message: { content: string, time: number }, location: { i: number, j: number }, pending_movement: boolean } } = {
  [CHATGPT_ID]: {
    name: CHATGPT_NAME,
    message_history: [],
    current_message: { content: '', time: 0 },
    location: { i: 0, j: 0 },
    pending_movement: false,
  },
}
let npc_action: {
  type: 'none' | 'move' | 'chat',
  location?: { i: number, j: number },
  message?: string,
} = { type: 'none' };
let current_thought_process: any = undefined;

let timestep: number = 0;

// Distance from [i, j] to [k, l]
const distances: number[][][][] = [];

for (let i = 0; i < WORLD_SIZE[0]; i++) {
  distances.push([])
  for (let j = 0; j < WORLD_SIZE[1]; j++) {
    distances[i].push([])
    for (let k = 0; k < WORLD_SIZE[0]; k++) {
      distances[i][j].push([])
      for (let l = 0; l < WORLD_SIZE[1]; l++) {
        distances[i][j][k].push(-1)  // -2 means we haven't visited this node yet
      }
    }

    const queue = []
    queue.push([i, j, 0])
    while (queue.length > 0) {
      const [k, l, distance] = queue.shift() as [number, number, number]

      distances[i][j][k][l] = distance;

      const neighbors = [
        [k - 1, l],
        [k + 1, l],
        [k, l - 1],
        [k, l + 1],
      ]
      for (const neighbor of neighbors) {
        const [ni, nj] = neighbor
        if (ni < 0 || ni >= WORLD_SIZE[0]) continue  // If we're out of bounds on the x axis
        if (nj < 0 || nj >= WORLD_SIZE[1]) continue  // If we're out of bounds on the y axis
        if (distances[i][j][ni][nj] !== -1) continue  // If we've already visited this node
        if (world[ni][nj] === 1) continue  // If this is a wall
        queue.push([ni, nj, distance + 1])
      }
    }
  }
}


export const configureServer = (server: ViteDevServer) => {
  if (!server.httpServer) return

  const io = new Server(server.httpServer)

  io.on('connection', (socket: any) => {
    players[socket.id] = {
      name: 'GPT',
      message_history: [],
      current_message: { content: '', time: 0 },
      location: { i: START_LOCATION[0], j: START_LOCATION[1] },
      pending_movement: false,
    };

    socket.on('movement', (data: { direction: 'up' | 'down' | 'left' | 'right' }) => {
      const player = players[socket.id]

      if (player.pending_movement) return
      player.pending_movement = true

      const [i_delta, j_delta] = DIRECTIONS[data.direction]

      players[socket.id].location = {
        i: players[socket.id].location.i + i_delta,
        j: players[socket.id].location.j + j_delta,
      };
    });

    socket.on('disconnect', () => {
      delete players[socket.id]
    })

    socket.on('chat', (data: { message: string }) => {
      if (data.message === '') return

      players[socket.id].current_message = { content: data.message, time: timestep }
      players[socket.id].message_history.push(data.message)
    });
  })

  const game_loop = setInterval(() => {
    timestep++;

    // Update the world
    for (const player_id in players) {
      const player = players[player_id]
      player.pending_movement = false
      
      if (player.current_message.time + MESSAGE_PERSISTENCE < timestep) {
        player.current_message.content = '';
      }
    }

    // Update the npc
    const npc = players[CHATGPT_ID]
    if (npc_action.location !== undefined) {
      const destination = npc_action.location as { i: number, j: number }

      if (npc.location === destination) {  // If we've reached our destination
        npc_action.location = undefined;
      } else {
        const neighbors = [];

        for (const direction in DIRECTIONS) {
          const [i_delta, j_delta] = DIRECTIONS[direction]
          const neighbor = {
            i: npc.location.i + i_delta,
            j: npc.location.j + j_delta,
          }
          
          if (neighbor.i < 0 || neighbor.i >= WORLD_SIZE[0]) continue  // If we're out of bounds on the x axis
          if (neighbor.j < 0 || neighbor.j >= WORLD_SIZE[1]) continue  // If we're out of bounds on the y axis
          if (world[neighbor.i][neighbor.j] === 1) continue  // If this is a wall
          neighbors.push(neighbor)
        }

        const distances_to_destination = neighbors.map(neighbor => { return { distance: distances[neighbor.i][neighbor.j][destination.i][destination.j], i: neighbor.i, j: neighbor.j }});
        distances_to_destination.sort((a, b) => a.distance - b.distance)
        const best_move = distances_to_destination[0]

        npc.location = {
          i: best_move.i,
          j: best_move.j,
        }
      }
    }
    
    if (npc_action.type === 'chat') {
      npc.current_message.content = npc_action.message as string
      npc.current_message.time = timestep
    }

    // Update the npc action
    npc_action.type === 'none'
    
    // Generate the next agent move if we are free to do so
    if (current_thought_process === undefined) {
      const player_names = Object.values(players).filter(player => player.name !== CHATGPT_NAME).map(player => player.name);
      player_names.push('HOME');

      const current_messages: { role: 'user', content: string }[] = Object.values(players).filter(player => player.name !== CHATGPT_NAME && player.current_message.content !== '').map(player => { return { role: 'user', content: `${player.name}: ${player.current_message.content}` }});

      current_thought_process = openai.chat.completions.create({
        messages: [
          { role: 'system', content: 'You are a person who lives in a grid world, walking around and talking to people. You will receive messages in the form "name: message", but you must reply as yourself if you choose to talk. Do not reply in the form "user: message", just reply with "message".' },
          ...current_messages,
        ],
        model: 'gpt-3.5-turbo-0613',
        functions: [
          {
            name: 'move',
            description: 'Move to a destination.',
            parameters: {
              type: 'object',
              properties: {
                destination: {
                  type: 'string',
                  description: 'The destination to go to. Possible destinations are other players or home.',
                  enum: player_names,
                },
              },
              required: ['destination'],
            },
          },
          {
            name: 'nothing',
            description: 'A no-op, do nothing.',
            parameters: {
              type: 'object',
              properties: {},
              required: [],
            },
          }
        ],
      });

      current_thought_process.then((chatCompletion) => {
        const output = chatCompletion.choices[0];
        if (output.finish_reason == 'function_call') {
          if (output.message.function_call === 'move') {
            const called_arguments = JSON.parse(output.message.function_call.arguments);
            let destination = npc.location;
            if (called_arguments.destination === HOME_NAME) {
              destination = { i: HOME_LOCATION[0], j: HOME_LOCATION[1] };
            } else {
              const destination_players = Object.values(players).filter(player => player.name === called_arguments.destination);

              if (destination_players.length > 0) {
                const destination_player = destination_players[0];
                destination = { i: destination_player.location.i, j: destination_player.location.j };
              }
            }
            npc_action = { type: 'move', location: { i: 0, j: 0 } };
          }
        } else {
          const message = chatCompletion.choices[0].text;

          npc_action = { type: 'chat', message };
        }

        current_thought_process = undefined;
      });
    }

    io.emit('update', {
      world,
      players,
    });
  }, TICK_RATE);
}