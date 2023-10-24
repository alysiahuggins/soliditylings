import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import * as fs from 'fs';
import { exec, execSync } from 'child_process'; // to run shell commands
import chalk from 'chalk'; // for styling console output
import {Exercise, ExerciseList, Mode, State} from './exercise';

function verify(exercises: Exercise[], verbose: boolean, successHints: boolean) {
    let completed = 0;
    for (const exercise of exercises) {
        // Simplified: use child_process to compile and test
        const result = exercise.runForgeTest();
        if(result.stderr){
            console.log("error in we tail");
            console.log(result.stderr);
        }else{
            console.log("yay success");
            console.log(result.stdout);
        }
        
        // execSync(`forge test --match-path ${exercise.path}`, { encoding: 'utf8' })
        // exec(`hardhat test ${exercise.path}`, (error, stdout) => {
        //     if (error) {
        //         console.log(error);
        //         console.error(chalk.red(`Failed test for ${exercise.name}`));
        //         console.error(chalk.red(stdout));
        //     } else {
        //         if (verbose) {
        //             console.log(stdout);
        //         }
        //         completed++;
        //         console.log(chalk.green(`Success for ${exercise.name}`));
        //         if (completed === exercises.length) {
        //             console.log(chalk.green(`🎉 All exercises completed! 🎉`));
        //         }
        //     }
        // });
    }
}

yargs(hideBin(process.argv))
    .command('verify', 'Verify all exercises', {}, (argv:any) => {
        const exercises: Exercise[] = [ 
            new Exercise("Test1", "test/reentrancy/reentrancy1.t.sol", Mode.Test, "No hints :)")
        ];
        verify(exercises, !!argv.verbose, !!argv.hints);
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
