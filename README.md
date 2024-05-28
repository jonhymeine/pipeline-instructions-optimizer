# Pipeline Instructions Protector

The main goal of this program is to read an input text file that contains the binary instructions based on RISC-V assembly, and apply a protection method chosen by the user to protect the CPU pipeline. Then, it creates an output text file that contains the protected binary instructions.
The execution also measures the ideal pipeline performance and the output file performance based on the pipeline's clock time provided by the user.

#### There are 4 protections method implemented:

-   **Only NOP solution:** insert NOP intructions where needed;
-   **Forwarding solution:** only adding NOP's to load instructions;
-   **Reordering instructions solution:** that searches for a substitute instruction to avoid conflicts when it won't create new ones, and, if there is no possible substitute, it adds NOP('s) to solve the conflict;
-   **Forwarding with reordering solution:** apply forwarding and reordering when a conflict is identified.

## Operation sequence

1. Input pipeline's clock time (in nanoseconds);
2. Choose the input file that contains the binary instructions;
3. Choose the protection method to be applied on the input file;
4. Execute the protection algorithm and measure the pipeline's performance;
5. Generate the output file that contains the optimized binary instructions;
6. Show the performance results.

## Assumptions

-   There is no branch prediction (consider avoiding conflicts in both paths for branch instructions and the only path for unconditional branch instructions);

## Execution

To run the program, simply run the command `npm start` in the terminal.

Then, input the pipeline's clock time, and select one file from the list of files inside folder `input`.

After that, it will generate an output file with the solution chosen applied, calculate the ideal pipeline performance, as well as the solution performance, and display them in the terminal.
