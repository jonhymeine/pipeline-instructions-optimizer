const AssemblyProgram = require('../models/AssemblyProgram');
const PerformanceCalculator = require('../models/PerformanceCalculator');

const readline = require('node:readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

const fs = require('fs');
const input_folder = './input/';
const output_folder = './output/';

class ProgramController {
    /**
     * Files in the input folder
     * @type {string[]}
     */
    files;

    /**
     * AssemblyProgram object
     * @type {AssemblyProgram}
     * @private
     */
    #program = new AssemblyProgram();

    /**
     * Exports the solution to a file
     * @param {string} input_file_name - Input file name
     * @private
    */
    #export_solution(input_file_name) {
        try {
            if (this.files.includes(input_file_name) == false) {
                console.clear();
                console.error('Invalid file name');
                this.show_option();
                return;
            }
            const data = fs.readFileSync(`${input_folder}${input_file_name}`, 'utf8');
            this.#program.set_instructions(data);
            this.#program.add_nops_to_instructions();

            const output_file_name = input_file_name.replace('.txt', '_output.txt');
            const content = this.#program.get_raw_instructions();
            fs.writeFileSync(`${output_folder}${output_file_name}`, content);
            console.clear();
            console.log(`Output file created: ${output_folder}${output_file_name}`);
            this.show_option();

        } catch (err) {
            console.error(err);
        }
    }

    /**
     * Asks the user to select a file
     */
    show_option() {
        try {
            this.files = fs.readdirSync(input_folder);
            let question = 'Select a file:\n';
            this.files.forEach((file, index) => {
                question += `${index + 1} - ${file}\n`;
            });
            question += 'X - Exit\n\nOption: ';

            rl.question(question, option => {
                if (option == 'X' || option == 'x') {
                    rl.close();
                    return;
                }
                const file_name = this.files[option - 1];
                this.#export_solution(file_name);
            });
        } catch (error) {
            console.error('Error reading files', error);
        }
    }

    /**
     * Asks the user for the pipeline's clock time
     * @private
     * @returns {number} - Pipeline's clock time
     */
    #ask_for_clock_time() {
        let clock_time;
        rl.question("Input the pipeline's clock time (in nanoseconds): ", time => {
            clock_time = time;
            rl.close();
        });
        return clock_time;
    }
}

module.exports = ProgramController;
