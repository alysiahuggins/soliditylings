import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const I_AM_DONE_REGEX = /^\s*\/\/\/?\s*I\s+AM\s+NOT\s+DONE/m;
const CONTEXT = 2;

interface ContextLine {
    line: string;
    number: number;
    important: boolean;
}


export enum Mode {
    Test = 'test',
}

export enum State {
    Done = 'done',
    Pending = 'pending',
}

export interface ExerciseList {
    exercises: Exercise[];
}

interface ExerciseOutput {
    stdout: string;
    stderr: string;
}

export class Exercise {
    readonly name: string;
    readonly path: string;
    mode: Mode;
    hint: string;

    constructor(name: string, path: string, mode: Mode, hint: string) {
        this.name = name;
        this.path = path;
        this.mode = mode;
        this.hint = hint;
      }


    public runCommand(args: string[]): ExerciseOutput {
        let response: ExerciseOutput = {
            stdout: '',
            stderr: ''
        }
        try{
            const cmd = execSync(`forge ${args.join(' ')}`, { encoding: 'utf8' });
            response.stdout = cmd;
        }catch(error){
            const execError = error as any; // Type assertion
            response.stderr = execError.stdout || execError.message;
        }

        return response;
    }

    public runForgeBuild():any {
        return this.runCommand(['build', '--contracts', this.path]);
    }

    public runForgeTest(): any {
        return this.runCommand(['test', '--match-path', this.path, '--summary']);
    }

    public state(): State {
        const source = fs.readFileSync(this.path, 'utf8');
        if (!I_AM_DONE_REGEX.test(source)) {
            return State.Done;
        }
        // TODO: Extract context similar to the Rust logic
        return State.Pending;
    }

    public looksDone(): boolean {
        return this.state() === State.Done;
    }

    // public state(): State | ContextLine[] {
    //     try {
    //         const source = fs.readFileSync(this.path, 'utf-8');
    //         const re = new RegExp(I_AM_DONE_REGEX);

    //         if (!re.test(source)) {
    //             return State.Done;
    //         }

    //         const lines = source.split('\n');
    //         const matchedLineIndex = lines.findIndex(line => re.test(line));

    //         if (matchedLineIndex === -1) {
    //             throw new Error("This should not happen at all");
    //         }

    //         const minLine = Math.max(matchedLineIndex - CONTEXT, 0);
    //         const maxLine = matchedLineIndex + CONTEXT;

    //         const context: ContextLine[] = lines
    //             .slice(minLine, maxLine + 1)
    //             .map((line, index) => ({
    //                 line: line,
    //                 number: minLine + index + 1,
    //                 important: (minLine + index) === matchedLineIndex
    //             }));

    //         return context;
    //     } catch (e) {
    //         throw new Error(`We were unable to process the exercise file ${this.path}! ${e.message}`);
    //     }
    // }
}
