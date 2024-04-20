const fs = require('fs');

const readline = require('node:readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const Instruction = require('./models/Instruction');

const instructions = [];

try {
    let data = fs.readFileSync('./input/input-file.txt', 'utf8');
    data = data.replace(/\r/g, '');
    const instructions_list = data.split('\n');
    if (instructions_list[instructions_list.length - 1] == '') {
        instructions_list.pop();
    }
    instructions_list.forEach((instruction) => {
        instructions.push(new Instruction(instruction));
    });
    console.log(instructions);


} catch (error) {
    console.error(error);
}

// rl.question(`Input pipeline's clock time (in nanoseconds): `, time => {
//   console.log(`Clock time set to ${time} ns`);
//   rl.close();
// });
