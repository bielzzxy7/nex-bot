import { readdir, stat } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Context } from './context.js';
import { Plugin } from './plugin.js';
import { Logger } from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class PluginManager {
    private plugins: Plugin[] = [];
    private pluginsDir: string;

    constructor() {
        this.pluginsDir = join(__dirname, '..', 'plugins');
    }

    async loadPlugins(): Promise<void> {
        Logger.bold('📦 Carregando plugins...');
        
        try {
            const entries = await readdir(this.pluginsDir);
            
            for (const entry of entries) {
                const fullPath = join(this.pluginsDir, entry);
                const stats = await stat(fullPath);

                if (stats.isDirectory()) {
                    const indexPath = join(fullPath, 'index.js');
                    try {
                        const module = await import('file://' + indexPath);
                        if (module.default && typeof module.default === 'object') {
                            const plugin = module.default as Plugin;
                            this.plugins.push(plugin);
                            Logger.pluginLoaded(plugin.name);
                        }
                    } catch (err) {
                        Logger.pluginError(entry, err);
                    }
                } else if (entry.endsWith('.js')) {
                    try {
                        const module = await import('file://' + fullPath);
                        if (module.default && typeof module.default === 'object') {
                            const plugin = module.default as Plugin;
                            this.plugins.push(plugin);
                            Logger.pluginLoaded(plugin.name);
                        }
                    } catch (err) {
                        Logger.pluginError(entry, err);
                    }
                }
            }

            Logger.boldGreen(`✅ ${this.plugins.length} plugin(s) carregado(s)\n`);
        } catch (err) {
            Logger.warn('⚠️ Nenhum plugin encontrado ou erro ao carregar\n');
        }
    }

    async processMessage(context: Context): Promise<void> {
        for (const plugin of this.plugins) {
            try {
                if (plugin.commands.includes(context.command)) {
                    await context.socket.sendPresenceUpdate('composing', context.from);
                    await plugin.handle(context);
                    await context.socket.sendPresenceUpdate('paused', context.from);
                }
            } catch (err) {
                Logger.error(`Não foi possível executar o plugin ${plugin.name}:`);
                Logger.error(String(err));
            }
        }
    }
}
