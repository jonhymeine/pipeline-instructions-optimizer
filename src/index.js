const fs = require('fs');

const readline = require('node:readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const InstructionController = require('./controllers/InstructionController');
const instructionController = new InstructionController();

try {
    let data = fs.readFileSync('./input/input-file.txt', 'utf8');

    instructionController.set_instructions(data);
    console.log(instructionController.get_instructions());


} catch (error) {
    console.error(error);
}

// rl.question(`Input pipeline's clock time (in nanoseconds): `, time => {
//   console.log(`Clock time set to ${time} ns`);
//   rl.close();
// });
