const Instruction = require('../models/Instruction');

class InstructionController {
    /**
     * @type {Instruction[]}
     * Instructions list
     */
    #instructions = [];

    /**
     * Get instructions array
     */
    get_instructions() {
        return this.#instructions;
    }

    /**
     * Set instructions array from raw text
     * @param {string} raw_instructions - List of RISC-V assembly binary instructions
     */
    set_instructions(raw_instructions) {
        raw_instructions = raw_instructions.replace(/\r/g, '');
        const instructions_list = raw_instructions.split('\n');

        if (instructions_list[instructions_list.length - 1] == '') {
            instructions_list.pop();
        }

        this.#instructions = instructions_list.map(instruction => new Instruction(instruction));
    }
}

module.exports = InstructionController;