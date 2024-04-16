const crypto = require('crypto');
const readline = require('readline');
const Table = require("cli-table3");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
function generateRandomKey() {
    return crypto.randomBytes(32).toString('hex');
}
function generateHmac(move, key) {
    const hmac = crypto.createHmac('sha256', key);
    hmac.update(move);
    return hmac.digest('hex');
}
function getResult(userMoveIndex, computerMoveIndex, numMoves) {
    if (userMoveIndex === computerMoveIndex) {
        return 0;
    } else if ((userMoveIndex + 1) % numMoves === computerMoveIndex || (userMoveIndex + 3) % numMoves === computerMoveIndex) {
        return 1;
    } else {
        return -1;
    }
}
function printHelp(moves) {
    console.log("User vs. PC Moves Table (Results from User's Point of View)\n");
    console.log("Example: If the user chooses 'Rock' and the PC chooses 'Scissors', the user wins.\n");

    const table = new Table({
        head: ["Moves", ...moves]
    });
    moves.forEach((move, index) => {
        const row = [move];
        moves.forEach((_, j) => {
            const res = getResult(index, j, moves.length);
            row.push(res === 0 ? "Draw" : res === 1 ? "Win" : "Lose");
        });
        table.push(row);
    });
    console.log(table.toString());
}
function main(moves) {
    const uniqueMoves = [...new Set(moves)];
    if (moves.length < 3 || moves.length % 2 === 0 || uniqueMoves.length !== moves.length) {
        console.log("Error: Please provide an odd number of unique moves (>=3) without repetition");
        rl.close();
        return;
    }

    const key = generateRandomKey();
    const computerMoveIndex = Math.floor(Math.random() * moves.length);
    const computerMove = moves[computerMoveIndex];
    const hmac = generateHmac(computerMove, key);

    console.log(`HMAC: ${hmac}\n`);

    console.log("Available moves:");
    moves.forEach((move, index) => console.log(`${index + 1} - ${move}`));
    console.log("0 - exit");
    console.log("? - help");

    rl.question('Enter your move: ', (userMoveIndex) => {
        if (userMoveIndex === '?') {
            printHelp(moves);
            main(moves);
            return;
        }
        userMoveIndex = parseInt(userMoveIndex);

        if (userMoveIndex === 0 || isNaN(userMoveIndex)) {
            console.log("Exiting the game...");
            rl.close();
            return;
        }
        if (userMoveIndex < 1 || userMoveIndex > moves.length) {
            console.log("Invalid input. Please try again.");
            main(moves);
            return;
        }
        const userMove = moves[userMoveIndex - 1];
        console.log(`Your move: ${userMove}`);
        console.log(`Computer's move: ${computerMove}`);

        const result = getResult(userMoveIndex - 1, computerMoveIndex, moves.length);

        if (result === 0) {
            console.log("It's a draw!");
        } else if (result < 1) {
            console.log("You win!");
        } else {
            console.log("Computer wins!");
        }
        console.log(`HMAC key: ${key}`);
        rl.close();
    });
}

const args = process.argv.slice(2);
main(args);

