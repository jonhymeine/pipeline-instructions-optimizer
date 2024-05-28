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
     * @returns {Promise<void>}
     */
    async #ask_for_clock_time() {
        try {
            const question = "Input the pipeline's clock time (in nanoseconds): ";
            const time = await new Promise(resolve => {
                rl.question(question, time => {
                    resolve(time);
                });
            });
            this.#clock_time = parseFloat(time);
        } catch (error) {
            console.error('Error reading clock time', error);
        }
    }

    /**
     * Exports the solution to a file
     * @param {string} input_file_name - Input file name
     * @private
     * @returns {Promise<void>}
     */

    async #export_solution(input_file_name) {
        try {
            const data = fs.readFileSync(`${input_folder}${input_file_name}`, 'utf8');
            this.#assembly_program.set_instructions(data);

            this.#before_solution = this.#performance_calculator.calculate_performance(
                this.#assembly_program,
                this.#clock_time
            );

            await this.#request_method();
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

            console.clear();
            this.#show_results(`${output_folder}${output_file_name}`);
            this.run(false);
        } catch (err) {
            console.error(err);
        }
    }

    /**
     * Asks the user to select a file
     * @private
     * @returns {Promise<string>} File name
     */
    async #request_file() {
        try {
            this.#files = fs.readdirSync(input_folder);
            let question = 'Select a file:\n';
            this.#files.forEach((file, index) => {
                question += `${index + 1} - ${file}\n`;
            });
            question += 'X - Exit\n\nOption: ';

            const option = await new Promise(resolve => {
                rl.question(question, option => {
                    resolve(option);
                });
            });

            if (option == 'X' || option == 'x') {
                rl.close();
                return '';
            }
            const file_name = this.#files[option - 1];
            if (!this.#files.includes(file_name)) {
                console.clear();
                console.error('Invalid option\n');
                this.#request_file();
                return;
            }
            return file_name;
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

        console.log(`Output file created: ${output_path}\n`);
    }

    /**
     * Asks the user to select a method
     * @private
     * @returns {Promise<void>}
     */
    async #request_method() {
        try {
            const question =
                'Select a method:\n' +
                '1 - Only Nops Solution\n' +
                '2 - Forwarding Solution\n' +
                '3 - Reordering Solution\n' +
                '4 - Forwarding Solution with Reordering\n' +
                'Option: ';

            const option = await new Promise(resolve => {
                rl.question(question, option => {
                    resolve(option);
                });
            });

            switch (option) {
                case '1':
                    this.#assembly_program.only_nop_solution();
                    break;
                case '2':
                    this.#assembly_program.forwarding_solution(false);
                    break;
                case '3':
                    this.#assembly_program.reordering_solution();
                    break;
                case '4':
                    this.#assembly_program.forwarding_solution(true);
                    break;
                default:
                    console.clear();
                    console.error('Invalid option\n');
                    await this.#request_method();
                    break;
            }
        } catch (error) {
            console.error('Error reading method', error);
        }
    }
    /**
     * Run the Program
     * @param {boolean} first_time - If it's the first time running the program
     */
    async run(first_time) {
        if (first_time) {
            console.clear();
            await this.#ask_for_clock_time();
        }
        const file_name = await this.#request_file();
        if (file_name == '') {
            rl.close();
            return;
        }
        await this.#export_solution(file_name);
    }
}

module.exports = ProgramController;
