<script lang="ts">
	import { enhance } from '$app/forms';
	let status: 'loading' | 'success' | 'error' | 'win' | 'tie' | 'lose' = 'success';
	let board = [
		['', '', ''],
		['', '', ''],
		['', '', ''],
	];
  
  function checkFull(): boolean {
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[i][j] == '') {
          return false;
        }
      }
    }

    return true;
  }

  function checkWin(player: 'X' | 'O'): boolean {
    for (let i = 0; i < 3; i++) {  // Check for three in a row
      if (board[i][0] == player && board[i][1] == player && board[i][2] == player) {
        return true;
      }
    }

    for (let j = 0; j < 3; j++) {  // Check for three in a column
      if (board[0][j] == player && board[1][j] == player && board[2][j] == player) {
        return true;
      }
    }

    if (board[0][0] == player && board[1][1] == player && board[2][2] == player) {  // Check for three in a diagonal
      return true;
    }

    if (board[0][2] == player && board[1][1] == player && board[2][0] == player) {  // Check for three in a diagonal
      return true;
    }

    return false;
  }
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
	<h1>Play Tic Tac Toe!</h1>
	<form
		action="?/play"
		method="post"
    class="w-full flex flex-col justify-center items-center space-y-6"
		use:enhance={({ form, data, action, cancel, submitter }) => {
      const position = data.get('spot');

      if (position === null) {
        cancel();
        return;
      }

      const [i, j] = position.split(',');
      board[i][j] = 'X';

      if (checkWin('X')) {
        status = 'win';
        cancel();
        return;
      } else if (checkFull()) {
        status = 'tie';
        cancel();
        return;
      }

			status = 'loading';
      
			return async ({ result, update }) => {
				if (result.status === 200 && result.type == "success") {
					let spot = board[result.data.y][result.data.x];

					if (spot == '') {
						board[result.data.y][result.data.x] = 'O';

            if (checkWin('O')) {
              status = 'lose';
            } else {
              status = 'success';
            }
					} else {
						status = 'error';
					}
				} else {
					status = 'error';
				}
			};
		}}
	>
    <div class="flex flex-col justify-center items-center space-y-2">
      {#each board as row, i}
        <div class="flex flex-row justify-center items-center space-x-2">
          {#each row as spot, j}
            <div class="w-12 h-12 flex flex-row justify-center items-center">
              {#if spot == ''}
                <input type="radio" name="spot" value={[i, j]} disabled={status !== 'success'} />
              {:else}
                <p>{spot}</p>
              {/if}
            </div>
          {/each}
        </div>
      {/each}
    </div>
		<input type="hidden" value={board} name="board" />
		<button aria-busy={status == 'loading'} type="submit">{status == 'loading' ? 'Please Wait...' : 'Submit'}</button>
	</form>

	{#if status === 'error'}
		<p>There was an error processing your request. Please try again.</p>
	{/if}

  {#if status === 'win'}
    <p>Winner Winner 🍗!</p>
  {/if}

  {#if status === 'tie'}
    <p>Tie</p>
  {/if}

  {#if status === 'lose'}
    <h2>L</h2>
  {/if}
</div>
