const fs = require('fs');

const readline = require('node:readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let instructions = [];

try {
    const data = fs.readFileSync('./input/input-file.txt', 'utf8');
    instructions = data.split('\r\n');
    if (instructions[instructions.length - 1] == '') {
        instructions.pop();
    }
    console.log(instructions);
    console.log(instructions[1].substring(25));
    console.log(instructions[1].substring(20, 25));
    
} catch (error) {
    console.error(error);
}

// rl.question(`Input pipeline's clock time (in nanoseconds): `, time => {
//   console.log(`Clock time set to ${time} ns`);
//   rl.close();
// });
