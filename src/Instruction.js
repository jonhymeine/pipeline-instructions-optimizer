class Instruction {
    opcode;
    rd = '';
    rs1 = '';
    rs2 = '';

    constructor(instruction) {
        this.opcode = instruction.substring(25);
        if (this.opcode == '0110011') {
            this.rd = instruction.substring(20, 5);
        }
    }
}