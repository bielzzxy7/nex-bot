import { Plugin } from '../../core/plugin.js';
import { Context } from '../../core/context.js';

const ping: Plugin = {
    name: 'ping',
    commands: ['ping'],

    async handle(context: Context): Promise<void> {
        const start = Date.now();
        await context.reply('🏓 Pong!');
        const latency = Date.now() - start;
        await context.send(`⏱️ Latência: ${latency}ms`);
    },
};

export default ping;
