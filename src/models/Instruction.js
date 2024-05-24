class Instruction {
    /**
     * @type {string}
     * Raw instruction
     */
    raw_instruction;

    /**
     * @type {string}
     * Instruction opcode
     */
    opcode;

    /**
     * @type {string}
     * Instruction format
     */
    format;

    /**
     * @type {string}
     * Instruction rd
     */
    rd;

    /**
     * @type {string}
     * Instruction rs1
     */
    rs1;

    /**
     * @type {string}
     * Instruction rs2
     */
    rs2;

    /**
     * @type {string}
     * Instruction funct3
     */
    funct3;

    /**
     * @type {string}
     * Binary immediate value
     */
    binary_immediate;

    /**
     * @type {number}
     * Decimal immediate value
     */
    decimal_immediate;

    /**
     * @type {Instruction}
     * Branch target
     */
    branch_target;

    /**
     * @type {boolean}
     * Is NOP instruction
     * @default false
     */
    is_nop = false;

    /**
     * @param {string} instruction - RISC-V assembly binary instruction
     */
    constructor(instruction) {
        if (instruction == '00000000000000000000000000010011') {
            this.is_nop = true;
        }
        this.raw_instruction = instruction;
        this.opcode = instruction.substring(25);
        if (this.opcode == '0110011') {
            this.format = 'R';
            this.rd = instruction.substring(20, 25);
            this.rs1 = instruction.substring(12, 17);
            this.rs2 = instruction.substring(7, 12);
            this.funct3 = instruction.substring(17, 20);
        } else if (
            this.opcode == '0010011' ||
            this.opcode == '0000011' ||
            this.opcode == '1100111' ||
            this.opcode == '1110011' ||
            this.opcode == '0001111'
        ) {
            this.format = 'I';
            this.rd = instruction.substring(20, 25);
            this.rs1 = instruction.substring(12, 17);
            this.funct3 = instruction.substring(17, 20);
            this.binary_immediate = instruction.substring(0, 12);
            this.decimal_immediate = this.#binary_to_decimal(this.binary_immediate);
        } else if (this.opcode == '1100011') {
            this.format = 'B';
            this.rs1 = instruction.substring(12, 17);
            this.rs2 = instruction.substring(7, 12);
            this.funct3 = instruction.substring(17, 20);
            this.binary_immediate =
                instruction.substring(0, 1) +
                instruction.substring(24, 25) +
                instruction.substring(1, 7) +
                instruction.substring(20, 24) +
                '0';
            this.decimal_immediate = this.#binary_to_decimal(this.binary_immediate);
        } else if (this.opcode == '0100011') {
            this.format = 'S';
            this.rs1 = instruction.substring(12, 17);
            this.rs2 = instruction.substring(7, 12);
            this.funct3 = instruction.substring(17, 20);
            this.binary_immediate = instruction.substring(0, 7) + instruction.substring(20, 25);
            this.decimal_immediate = this.#binary_to_decimal(this.binary_immediate);
        } else if (this.opcode == '0110111' || this.opcode == '0010111') {
            this.format = 'U';
            this.rd = instruction.substring(20, 25);
            this.binary_immediate = instruction.substring(0, 20);
            this.decimal_immediate = this.#binary_to_decimal(this.binary_immediate);
        } else if (this.opcode == '1101111') {
            this.format = 'J';
            this.rd = instruction.substring(20, 25);
            this.binary_immediate =
                instruction.substring(0, 1) +
                instruction.substring(12, 20) +
                instruction.substring(11, 12) +
                instruction.substring(1, 11) +
                '0';
            this.decimal_immediate = this.#binary_to_decimal(this.binary_immediate);
        }
    }

    /**
     * Convert binary to decimal
     * @param {string} binary - Binary number
     * @returns {number} - Decimal number
     */
    #binary_to_decimal(binary) {
        let extended_binary;

        if (binary[0] == '1') {
            extended_binary = binary.padStart(32, 1);
        } else {
            extended_binary = binary.padStart(32, 0);
        }
        return ~~Number.parseInt(extended_binary, 2);
    }

    /**
     * Recreate raw instruction
     */
    recreate_raw_instruction() {
        if (this.format == 'B') {
            this.raw_instruction =
                this.binary_immediate.substring(0, 1) +
                this.binary_immediate.substring(2, 8) +
                this.rs2 +
                this.rs1 +
                this.funct3 +
                this.binary_immediate.substring(8, 12) +
                this.binary_immediate.substring(1, 2) +
                this.opcode;
        } else if (this.format == 'J') {
            this.raw_instruction =
                this.binary_immediate.substring(0, 1) +
                this.binary_immediate.substring(10, 20) +
                this.binary_immediate.substring(9, 10) +
                this.binary_immediate.substring(1, 9) +
                this.rd +
                this.opcode;
        }
    }
}

module.exports = Instruction;
