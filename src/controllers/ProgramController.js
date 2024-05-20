const AssemblyProgram = require('../models/AssemblyProgram');
const PerformanceCalculator = require('../models/PerformanceCalculator');

const readline = require('node:readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
});

const fs = require('fs');
const input_folder = './input/';
const output_folder = './output/';

class ProgramController {
    /**
     * Files in the input folder
     * @type {string[]}
     * @private
     */
    #files;

    /**
     * Pipeline's clock time
     * @type {number}
     * @private
     */
    #clock_time;

    /**
     * Before solution Performance
     * @type {{instructions_count: number, cycles_count: number, execution_time: number}}
     * @private
     */
    #before_solution;

    /**
     * After solution Performance
     * @type {{instructions_count: number, cycles_count: number, execution_time: number}}
     * @private
     */
    #after_solution;

    /**
     * AssemblyProgram object
     * @type {AssemblyProgram}
     * @private
     */
    #assembly_program = new AssemblyProgram();

    /**
     * PerformanceCalculator object
     * @type {PerformanceCalculator}
     * @private
     */
    #performance_calculator = new PerformanceCalculator();

    /**
     * Asks the user for the pipeline's clock time
     * @private
     * @returns {number} - Pipeline's clock time
     */
    #ask_for_clock_time() {
        try {
            rl.question("Input the pipeline's clock time (in nanoseconds): ", time => {
                this.#clock_time = time;
                this.#request_file();
            });
        } catch (error) {
            console.error('Error reading clock time', error);
        }
    }

    /**
     * Exports the solution to a file
     * @param {string} input_file_name - Input file name
     * @private
     */

    #export_solution(input_file_name) {
        try {
            const data = fs.readFileSync(`${input_folder}${input_file_name}`, 'utf8');
            this.#assembly_program.set_instructions(data);

            this.#before_solution = this.#performance_calculator.calculate_performance(
                this.#assembly_program,
                this.#clock_time
            );
            this.#assembly_program.add_nops_to_instructions();
            this.#after_solution = this.#performance_calculator.calculate_performance(
                this.#assembly_program,
                this.#clock_time
            );

            if (!fs.existsSync(output_folder)) {
                fs.mkdirSync(output_folder);
            }
            const output_file_name = input_file_name.replace('.txt', '_output.txt');
            const content = this.#assembly_program.get_raw_instructions();
            fs.writeFileSync(`${output_folder}${output_file_name}`, content);

            // console.clear();
            this.#show_results(`${output_folder}${output_file_name}`);
            this.#request_file();
        } catch (err) {
            console.error(err);
        }
    }

    /**
     * Asks the user to select a file
     * @private
     */
    async #request_file() {
        try {
            this.#files = fs.readdirSync(input_folder);
            let question = 'Select a file:\n';
            this.#files.forEach((file, index) => {
                question += `${index + 1} - ${file}\n`;
            });
            question += 'X - Exit\n\nOption: ';

            await rl.question(question, option => {
                if (option == 'X' || option == 'x') {
                    rl.close();
                    return;
                }
                const file_name = this.#files[option - 1];
                if (!this.#files.includes(file_name)) {
                    console.clear();
                    console.error('Invalid file');
                    this.#request_file();
                    return;
                }

                this.#export_solution(file_name);
            });
        } catch (error) {
            console.error('Error reading files', error);
        }
    }

    /**
     * Calculate the performance
     * @param {string} output_path - Output file path
     * @private
     */
    #show_results(output_path) {
        [this.#before_solution, this.#after_solution].forEach((solution, index) => {
            if (index == 0) {
                console.log('Ideal pipeline:');
            } else {
                console.log('After solution:');
            }
            console.log(
                'Instructions:',
                solution.instructions_count,
                '\nCycles:',
                solution.cycles_count,
                '\nExecution time:',
                solution.execution_time,
                'ns\n'
            );
        });

        let performance_comparison = this.#performance_calculator.compare_performance(
            this.#before_solution,
            this.#after_solution
        );
        performance_comparison = parseFloat(performance_comparison.toFixed(4));
        console.log(`The ideal pipeline is ${performance_comparison} times faster than the NOP's solution`);

        console.log(`Output file created: ${output_path}`);
    }

    /**
     * Run the Program
     */
    run() {
        console.clear();
        this.#ask_for_clock_time();
    }
}

module.exports = ProgramController;
