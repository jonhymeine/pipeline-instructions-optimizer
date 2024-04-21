const Instruction = require('./Instruction');

class AssemblyProgram {
    /**
     * Instructions list
     * @type {Instruction[]}
    */
    #instructions = [];

    /**
     * Get instructions array
     * @returns {Instruction[]} Instructions array
    */
    get_instructions() {
        return this.#instructions;
    }

    /**
     * Get raw instructions
     * @returns {string} List of RISC-V assembly binary instructions
    */
    get_raw_instructions() {
        let raw_instructions = '';
        this.#instructions.forEach(instruction => {
            raw_instructions += instruction.raw_instruction + '\r\n';
        });
        return raw_instructions;
    }

    /**
     * Set instructions array from raw text
     * @param {string} raw_instructions List of RISC-V assembly binary instructions
    */
    set_instructions(raw_instructions) {
        raw_instructions = raw_instructions.replace(/\r/g, '');
        const instructions_list = raw_instructions.split('\n');

        if (instructions_list[instructions_list.length - 1] == '') {
            instructions_list.pop();
        }

        this.#instructions = instructions_list.map(instruction => new Instruction(instruction));
    }

    /**
     * Print instructions to console
    */
    print_instructions() {
        this.#instructions.forEach(instruction => {
            console.log(instruction.raw_instruction);
        });
    }

    /**
     * Create a NOP instruction
     * @returns {Instruction} NOP instruction
     * @private
    */
    #create_nop() {
        return new Instruction('00000000000000000000000000010011');
    }

    /**
     * Add NOP instructions to the program
    */
    add_nops_to_instructions() {
        let in_use;
        for (let i = 0; i < this.#instructions.length; i++) {
            if (this.#instructions[i].rs1 == in_use || this.#instructions[i].rs2 == in_use) {
                this.#instructions.splice(i, 0, this.#create_nop(), this.#create_nop());
                i += 2;
                in_use = null;
            }

            if (this.#instructions[i].format == 'I' || this.#instructions[i].format == 'R' || this.#instructions[i].format == 'U') {
                in_use = this.#instructions[i].rd;
            }
        }
    }
}

module.exports = AssemblyProgram;