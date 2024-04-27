const AssemblyProgram = require('./AssemblyProgram');

class PerformanceCalculator {
    /**
     * Calculates program performance
     * @param {AssemblyProgram} assembly_program - AssemblyProgram object
     * @param {number} clock_time - Pipeline's clock time
     * @returns {Object} - Object containing the number of cycles and the execution time
     */
    calculate_performance(assembly_program, clock_time) {
        const instructions_count = assembly_program.get_instructions().length;
        const cycles_count = instructions_count + 4;
        const execution_time = cycles_count * clock_time;

        return {
            instructions_count,
            cycles_count,
            execution_time,
        };
    }

    /**
     * Compare two performances, with performance_b being [performance] times faster than performance_a
     * @param {{instructions_count: number, cycles_count: number, execution_time: number}} performance_a - Performance object
     * @param {{instructions_count: number, cycles_count: number, execution_time: number}} performance_b - Performance object
     * @returns {number} - Performance comparison
     */
    compare_performance(performance_a, performance_b) {
        const performance = performance_b.execution_time / performance_a.execution_time;

        return performance;
    }
}

module.exports = PerformanceCalculator;
