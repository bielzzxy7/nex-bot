import { Context } from './context.js';

export interface Plugin {
    name: string;
    commands: string[];
    handle(context: Context): Promise<void>;
}
