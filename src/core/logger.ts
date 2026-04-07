import chalk from 'chalk';

export const Logger = {
    info: (msg: string) => console.log(chalk.blue(msg)),
    success: (msg: string) => console.log(chalk.green(msg)),
    error: (msg: string) => console.log(chalk.red(msg)),
    warn: (msg: string) => console.log(chalk.yellow(msg)),
    gray: (msg: string) => console.log(chalk.gray(msg)),
    
    bold: (msg: string) => console.log(chalk.bold(msg)),
    boldGreen: (msg: string) => console.log(chalk.bold.green(msg)),
    boldRed: (msg: string) => console.log(chalk.bold.red(msg)),
    
    pluginLoaded: (name: string) => 
        console.log(chalk.green.bold(`  ✓ ${name}`)),
    pluginError: (entry: string, err: unknown) => 
        console.log(chalk.red.bold(`  ✗ ${entry}: ${err}`)),
};
