const Program = require('./AssemblyProgram');

const readline = require('node:readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

class PerformanceCalculator {
    /**
     * Calculates program performance
     * @param {Program} program - Program object
     * @param {number} clock_time - Pipeline's clock time
    */
    calculate_performance(program, clock_time) {
        const instructions_count = program.get_instructions().length;
        const cycles_count = instructions_count + 4;
        const execution_time = cycles_count * clock_time;

        console.log(`Cycles count: ${cycles_count}\nExecution time: ${execution_time} nanoseconds`);
    }
}

module.exports = PerformanceCalculator;