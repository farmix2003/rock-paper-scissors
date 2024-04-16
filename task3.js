const crypto = require('crypto');
const readline = require('readline');

const r1 = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

function createRandomKey() {
    return crypto.randomBytes(32).toString('hex')
}

function generateHmac(move, key) {
    const hmac = crypto.createHmac('sha256', key);
    hmac.update(move);
    return hmac.digest('hex');
}

function getResult(userMoveIndex, computerMoveIndex, numOfMoves) {
    if (userMoveIndex === computerMoveIndex) {
        return 0;
    } else if ((userMoveIndex + 1) % numOfMoves === computerMoveIndex || (userMoveIndex + 3) % numOfMoves === computerMoveIndex) {
        return 1;
    } else {
        return -1;
    }
}

function printHelp(moves) {
    const numOfMoves = moves.length
    console.log("User vs. PC Moves Table (Results from User's Point of View)\n")
    console.log("Example: If the user chooses 'Rock' and the PC chooses 'Scissors', the user wins.\n")

    console.log("+Moves+  " + moves.map(move => `+${move}+`).join("  "));
    for (let i = 0; i < numOfMoves; i++) {
        let row = `|${moves[i]}`
        for (let j = 0; j < numOfMoves; j++) {
            const res = getResult(i, j, numOfMoves)
            if (res === 0) {
                row += "|   Draw ";
            } else if (res === 1) {
                row += "|   Win  ";
            } else {
                row += "|   Lose ";
            }
        }
        console.log(row + "|");
    }
    console.log("\n0 - exit");
    console.log("? - help\n")
}

function main(moves) {
    if (moves.length < 3 || moves.length % 2 === 0) {
        console.log("Error: Please provide an odd number of unique moves (>=3) as command line arguments");
        console.log("Example: node game.js rock paper scissors")
        process.exit(1)
    }

    const uniqueMoves = [...new Set(moves)];
    if (uniqueMoves.length !== moves.length) {
        console.log("Error: Please provide unique moves without repetition");
        process.exit(1);

    }

    const key = createRandomKey()

    const computerMoveIndex = Math.floor(Math.random() * moves.length)
    const computerMove = moves[computerMoveIndex]
    const hmac = generateHmac(computerMove, key)

    console.log(`HMAC: ${hmac}\n`)

    printHelp(moves);

    r1.question("Enter your move: ", (userMoveIndex) => {
        userMoveIndex = parseInt(userMoveIndex)
        if (userMoveIndex === 0 || isNaN(userMoveIndex)) {
            console.log("Exiting...");
            r1.close();
            return
        }
        if (userMoveIndex < 1 || userMoveIndex > moves.length) {
            console.log("\nInvalid move\n")
            main(moves)
            return
        }
        const userMove = moves[userMoveIndex - 1]
        console.log(`Your move: ${userMove}`)
        console.log(`Computer's move: ${computerMove}`)

        const result = getResult(userMoveIndex - 1, computerMoveIndex, moves.length)
        if (result === 0) {
            console.log("It's draw");
        } else if (result < 1) {
            console.log("You win!");
        } else {
            console.log("Computer wins!");
        }

        console.log(`HMAC key: ${key}`);
        r1.close();
    })
}


const args = process.argv.slice(2);
if (args.includes('?')) {
    printHelp(args.filter(arg => arg !== '?'))
} else {
    main(args)
}
