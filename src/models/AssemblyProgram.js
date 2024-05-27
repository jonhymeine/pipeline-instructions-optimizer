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
     * Set branch targets
     * @private
     */
    #set_branch_targets() {
        this.#branch_instructions = [];
        this.#instructions.forEach((instruction, index) => {
            if (instruction.format == 'B' || instruction.format == 'J') {
                const target = index + instruction.decimal_immediate / 4;
                instruction.branch_target = this.#instructions[target];
                this.#branch_instructions.push(instruction);
            } else if (instruction.opcode == '1100111') {
                const target = index + instruction.decimal_immediate / 4;
                instruction.branch_target = this.#instructions[target];
                this.#branch_instructions.push(instruction);
            }
        });
    }

    /**
     * Add NOP instructions to branch instructions
     * @private
     */
    #add_branch_nops() {
        this.#branch_instructions.forEach(instruction => {
            const instruction_index = this.#instructions.indexOf(instruction);

            if (instruction.opcode == '1100111') {
                if (instruction_index + 1 < this.#instructions.length) {
                    this.#instructions.splice(instruction_index + 1, 0, this.#create_nop());
                }
                this.#instructions.splice(instruction_index, 0, this.#create_nop());
                return;
            }

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

    /**
     * Recalculate branch targets
     * @private
     */
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

    /**
     * Add NOP instructions to the program
     */
    only_nop_solution() {
        this.#set_branch_targets();
        const in_use = ['', ''];
        for (let i = 0; i < this.#instructions.length; i++) {
            const instruction = this.#instructions[i];

            if (instruction.opcode == '1100111') {
                in_use.splice(0, 2, '', '');
            }

            if (instruction.format == 'J' && ![0, 4].includes(instruction.decimal_immediate)) {
                in_use.splice(0, 2, '', '');
            } else if (instruction.rs1 == in_use[0] || instruction.rs2 == in_use[0]) {
                this.#instructions.splice(i, 0, this.#create_nop(), this.#create_nop());
                in_use.splice(0, 2, '', '');
                i += 2;
            } else if (instruction.rs1 == in_use[1] || instruction.rs2 == in_use[1]) {
                this.#instructions.splice(i, 0, this.#create_nop());
                in_use.splice(0, 1, '');
                i++;
            }

            if (instruction.rd != null && instruction.rd != '00000') {
                in_use.splice(0, 0, instruction.rd);
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

    /**
     * Apply forwarding solution, placing NOP instructions when necessary
     * @param {boolean} reorder_needed If the program needs to be reordered
     */
    forwarding_solution(reorder_needed) {
        this.#set_branch_targets();
        for (let i = 0; i < this.#instructions.length; i++) {
            let instruction = this.#instructions[i];
            if (instruction.opcode == '0000011' && i + 1 < this.#instructions.length) {
                const rd = instruction.rd;
                const next_instruction = this.#instructions[i + 1];
                if (next_instruction.rs1 == rd || next_instruction.rs2 == rd) {
                    if (reorder_needed) {
                        instruction = this.#search_substitute(i + 1, [rd]);
                        this.#instructions.splice(i + 1, 0, instruction);
                    } else {
                        this.#instructions.splice(i + 1, 0, this.#create_nop());
                        i++;
                    }
                }
            }
        }
        this.#recalculate_branch_targets();
    }

    /**
     * Search for a substitute instruction
     * @private
     * @param {Instruction} conflict_instruction Instruction to be replaced
     * @param {number} index Instruction index
     * @param {[string, string]} in_use Registers in use
     * @returns {Instruction} Substitute instruction
     */
    #search_substitute(index, in_use) {
        // console.log(this.#instructions[index], in_use);
        for (let i = index; i < this.#instructions.length; i++) {
            const instruction = this.#instructions[i];

            for (let j = 0; j < this.#branch_instructions.length; j++) {
                const branch_instruction = this.#branch_instructions[j];
                if (branch_instruction.branch_target == instruction) {
                    return this.#create_nop();
                }
            }

            if (
                instruction.format == 'J' ||
                instruction.format == 'B' ||
                instruction.opcode == '1100111' ||
                (instruction.opcode == '0010111' && in_use.includes(instruction.rd))
            ) {
                return this.#create_nop();
            }
            if (!in_use.includes(instruction.rs1) && !in_use.includes(instruction.rs2)) {
                const substitute_index = this.#instructions.indexOf(instruction);
                this.#instructions.splice(substitute_index, 1);
                return instruction;
            }
            if (instruction.rd != null && instruction.rd != '00000') {
                in_use.splice(0, 0, instruction.rd);
            }
        }
        return this.#create_nop();
    }

    /**
     * Apply sorting solution, placing NOP instructions when necessary
     */
    reordering_solution() {
        this.#set_branch_targets();
        const in_use = ['', ''];
        for (let i = 0; i < this.#instructions.length; i++) {
            let instruction = this.#instructions[i];

            if (instruction.opcode == '1100111') {
                in_use.splice(0, 2, '', '');
            }

            if (instruction.format == 'J' && ![0, 4].includes(instruction.decimal_immediate)) {
                in_use.splice(0, 2, '', '');
            } else if (in_use.includes(instruction.rs1) || in_use.includes(instruction.rs2)) {
                const aux_in_use = structuredClone(in_use);
                instruction = this.#search_substitute(i, aux_in_use);
                this.#instructions.splice(i, 0, instruction);
            }

            if (instruction.rd != null && instruction.rd != '00000') {
                in_use.splice(0, 0, instruction.rd);
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
}

module.exports = AssemblyProgram;
