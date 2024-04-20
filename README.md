# Pipeline Instructions Optimizer

The main goal of this program is to read an input text file that contains the binary instructions based on RISC-V assembly, and add NOP instructions where needed to optimize the CPU pipeline. Then, it creates an output text file that contains the optimized binary instructions.
The execution also measures the ideal pipeline performance and the output file performance based on the pipeline's clock time provided by the user.


## Operation sequence

1. Input pipeline's clock time (in nanoseconds);
2. Choose the input file that contains the binary instructions;
3. Execute the optimization and measure the pipeline's performance;
4. Generate the output file that contains the optimized binary instructions;
5. Show the performance results.


## Assumptions

- Structural hazards solved;
- Control hazards ignored;
- Branches e jumps never happen.


## Installation and Execution

After downloading/cloning this repository, you need to install its dependencies via npm by running ``npm install`` in the terminal.

Then, select the input file to be used in the algorithm, and to execute it, simply run the command ``npm start`` in the terminal.