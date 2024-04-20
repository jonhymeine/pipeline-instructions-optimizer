const fs = require('fs');

const readline = require('node:readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

let instructions;

try {
    let data = fs.readFileSync('./input/input-file.txt', 'utf8');
    data = data.replace(/\r/g, '');
    instructions = data.split('\n');
    if (instructions[instructions.length - 1] == '') {
        instructions.pop();
    }
    console.log(instructions);
    console.log(instructions[1].substring(25));
    console.log(instructions[1].substring(20, 25));
    console.log(instructions[1].substring(12, 17));
    console.log(instructions[1].substring(7, 12));

} catch (error) {
    console.error(error);
}

// rl.question(`Input pipeline's clock time (in nanoseconds): `, time => {
//   console.log(`Clock time set to ${time} ns`);
//   rl.close();
// });
