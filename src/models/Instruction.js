class Instruction {
    /**
     * @type {string}
     Instruction opcode
    */
    opcode;
    /**
     * @type {string}
     Instruction format
    */
    format = '';
    /**
     * @type {string}
     Instruction rd
    */
    rd = '';
    /**
     * @type {string}
     Instruction rs1
    */
    rs1 = '';
    /**
     * @type {string}
     Instruction rs2
    */
    rs2 = '';

    /**
     * @param {string} instruction - RISC-V assembly binary instruction
     */
    constructor(instruction) {
        this.opcode = instruction.substring(25);
        if (this.opcode == '0110011') {
            this.format = 'R';
            this.rd = instruction.substring(20, 25);
            this.rs1 = instruction.substring(12, 17);
            this.rs2 = instruction.substring(7, 12);
        } else if (this.opcode == '0010011' || this.opcode == '0000011' || this.opcode == '1100111' || this.opcode == '1110011' || this.opcode == '0001111') {
            this.format = 'I';
            this.rd = instruction.substring(20, 25);
            this.rs1 = instruction.substring(12, 17);
        } else if (this.opcode == '1100011') {
            this.format = 'B';
            this.rs1 = instruction.substring(12, 17);
            this.rs2 = instruction.substring(7, 12);
        }
        else if (this.opcode == '0100011') {
            this.format = 'S';
            this.rs1 = instruction.substring(12, 17);
            this.rs2 = instruction.substring(7, 12);
        }
        else if (this.opcode == '0110111' || this.opcode == '0010111') {
            this.format = 'U';
            this.rd = instruction.substring(20, 25);
        }
        else if (this.opcode == '1101111') {
            this.format = 'J';
            this.rd = instruction.substring(20, 25);
        }
    }
}

module.exports = Instruction;