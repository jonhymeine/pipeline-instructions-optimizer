const Instruction = require('./Instruction');

class AssemblyProgram {
    /**
     * Instructions list
     * @type {Instruction[]}
     * @private
     */
    #instructions = [];

    /**
     * Branch instructions list
     * @type {Instruction[]}
     * @private
     */
    #branch_instructions = [];

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
        this.#set_branch_targets();
        const in_use = ['', ''];
        for (let i = 0; i < this.#instructions.length; i++) {
            if (this.#instructions[i].format == 'J' && ![0, 4].includes(this.#instructions[i].decimal_immediate)) {
                in_use.splice(0, 2, '', '');
            } else if (this.#instructions[i].rs1 == in_use[0] || this.#instructions[i].rs2 == in_use[0]) {
                this.#instructions.splice(i, 0, this.#create_nop(), this.#create_nop());
                i += 2;
                in_use.splice(0, 2, '', '');
            } else if (this.#instructions[i].rs1 == in_use[1] || this.#instructions[i].rs2 == in_use[1]) {
                this.#instructions.splice(i, 0, this.#create_nop());
                i++;
                in_use.splice(0, 1, '');
            }
            if (this.#instructions[i].rd != null && this.#instructions[i].rd != '00000') {
                in_use.splice(0, 0, this.#instructions[i].rd);
            } else {
                in_use.splice(0, 0, '');
            }
            if (in_use.length > 2) {
                in_use.pop();
            }
        }
        this.#add_branch_nops();
        this.#recalculate_branch_targets();
    }

    #set_branch_targets() {
        this.#branch_instructions = [];
        this.#instructions.forEach((instruction, index) => {
            if (instruction.format == 'B' || instruction.format == 'J') {
                const target = index + instruction.decimal_immediate / 4;
                instruction.branch_target = this.#instructions[target];
                this.#branch_instructions.push(instruction);
            }
        });
    }

    #add_branch_nops() {
        this.#branch_instructions.forEach(instruction => {
            const instruction_index = this.#instructions.indexOf(instruction);
            if (instruction_index == 0) {
                return;
            }
            const previous_instruction = this.#instructions[instruction_index - 1];
            const in_use = previous_instruction.rd || '';

            const target = instruction.branch_target;
            const target_index = this.#instructions.indexOf(target);

            if (target.rs1 == in_use || target.rs2 == in_use) {
                const target_previous = this.#instructions[target_index - 1];

                if (target_previous.is_nop) {
                    instruction.branch_target = target_previous;
                } else {
                    this.#instructions.splice(target_index, 0, this.#create_nop());
                }
            }
        });
    }

    #recalculate_branch_targets() {
        this.#branch_instructions.forEach(instruction => {
            const instruction_index = this.#instructions.indexOf(instruction);
            const target_index = this.#instructions.indexOf(instruction.branch_target);

            const decimal_immediate = (target_index - instruction_index) * 4;
            instruction.decimal_immediate = decimal_immediate;

            let immediate_length;
            if (instruction.format == 'B') {
                immediate_length = 13;
            } else if (instruction.format == 'J') {
                immediate_length = 21;
            }

            let binary_immediate;
            if (decimal_immediate < 0) {
                binary_immediate = (~decimal_immediate)
                    .toString(2)
                    .split('')
                    .map(bit => (bit == '1' ? '0' : '1'))
                    .join('');
                binary_immediate = binary_immediate.padStart(immediate_length, '1');
            } else {
                binary_immediate = decimal_immediate.toString(2);
                binary_immediate = binary_immediate.padStart(immediate_length, '0');
            }

            instruction.binary_immediate = binary_immediate;
            instruction.recreate_raw_instruction();
        });
    }
}

module.exports = AssemblyProgram;
