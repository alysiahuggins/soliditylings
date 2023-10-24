import ProgressBar from "progress"; // Use the 'progress' npm package for ProgressBar
import chalk from "chalk"; // Use the 'chalk' npm package for styling console logs
import {Exercise, ExerciseList, Mode, State} from './exercise';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

export function verify(
    exercises: Iterable<Exercise>,
    progress: [number, number],
    verbose: boolean,
    successHints: boolean
): Exercise | null {
    let [numDone, total] = progress;
    const bar = new ProgressBar("Progress: [:bar] :current/:total :percent", {
        total: total,
        width: 60,
        complete: "#",
        incomplete: "-"
    });
    bar.tick(numDone);

    for (let exercise of exercises) {
        let compileResult: boolean | undefined;
        if (exercise.mode === Mode.Test) {
            compileResult = compileAndTest(exercise, RunMode.Interactive, verbose, successHints);
        }

        if (!compileResult) {
            return exercise;
        }
        bar.tick();
        if (bar.complete) {
            console.log(`🎉 🎉 You have completed Solidity Lings Security Edition! Well done! 🎉 🎉`);
        }
    }
    return null;
}

enum RunMode {
    Interactive,
    NonInteractive
}

export function test(exercise: Exercise, verbose: boolean): boolean {
    return compileAndTest(exercise, RunMode.NonInteractive, verbose, false);
}

function compileAndTest(
    exercise: Exercise,
    runMode: RunMode,
    verbose: boolean,
    successHints: boolean
): boolean {
    let compilationResult = exercise.runForgeTest();

    if (compilationResult.stdout) {
        if (verbose) {
            // Display output if necessary
        }
        if (runMode === RunMode.Interactive) {
            console.log("interactive");
            return promptForCompletion(exercise, undefined, successHints);
        } else {
            return true;
        }
    } else {
        console.warn(`Testing of ${exercise.name} failed! Please try again.`);
        // Display error output
        return false;
    }
}

function promptForCompletion(
    exercise: Exercise,
    promptOutput?: string,
    successHints?: boolean
): boolean {
    let context: any;
    switch (exercise.state()) {
        case State.Done:
            return true;
        case State.Pending:
            context = 2;
            break;
    }

    let successMsg = "";
    switch (exercise.mode) {
        case Mode.Test:
            successMsg = "The code is compiling, and the tests pass!";
            break;
    }

    console.log();
    if (process.env.NO_EMOJI) {
        console.log(`~*~ ${successMsg} ~*~`);
    } else {
        console.log(`🎉 🎉  ${successMsg} 🎉 🎉`);
    }

    if (promptOutput) {
        console.log("Output:");
        console.log(separator());
        console.log(promptOutput);
        console.log(separator());
    }

    if (successHints && exercise.hint) {
        console.log("Hints:");
        console.log(separator());
        console.log(exercise.hint);
        console.log(separator());
    }

    console.log("You can keep working on this exercise,");
    console.log(`or jump into the next one by removing the ${chalk.bold("`I AM NOT DONE`")} comment:`);
    for (let contextLine of context) {
        const formattedLine = contextLine.important
            ? chalk.bold(contextLine.line)
            : contextLine.line;

        console.log(
            `${chalk.blue(contextLine.number.toString())} ${chalk.blue("|")}  ${formattedLine}`
        );
    }

    return false;
}

function separator(): string {
    return chalk.bold("====================");
}

yargs(hideBin(process.argv))
    .command('verify', 'Verify all exercises', {}, (argv:any) => {
        const exercises: Exercise[] = [ 
            new Exercise("Test1", "test/reentrancy/reentrancy1.t.sol", Mode.Test, "No hints :)")
        ];
        verify(exercises, [0, 1], !!argv.verbose, !!argv.hints);
    })
    .option('verbose', {
        alias: 'v',
        type: 'boolean',
        description: 'Show verbose output'
    })
    .option('hints', {
        type: 'boolean',
        description: 'Show hints on success'
    })
    .help()
    .argv;
