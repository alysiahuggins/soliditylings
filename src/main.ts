
import fs from 'fs';
import toml from '@iarna/toml';

enum Subcommands {
    verify = 'verify',
    watch = 'watch'
}

function main(){
    const exercisesTomlPath = "info.toml";
    let args = process.argv; 

    if (!fs.existsSync(exercisesTomlPath)) {  // Pseudocode for checking file existence
        console.log(`Code must be run from the soliditylings directory`);
        console.log("Try `cd soliditylings/`!");
        process.exit(1);
    }else{
        const exercises = toml.parse(fs.readFileSync(exercisesTomlPath, 'utf-8'));
        console.log(exercises);
    }


}

main()