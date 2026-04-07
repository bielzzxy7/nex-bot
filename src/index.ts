import { Boom } from '@hapi/boom';
import { pino } from 'pino';
import {
    makeWASocket,
    DisconnectReason,
    useMultiFileAuthState,
    WAMessage,
    WASocket,
    Browsers,
    fetchLatestBaileysVersion,
} from '@whiskeysockets/baileys';
import { PluginManager } from './core/plugin-manager.js';
import { Context } from './core/context.js';
import { Logger } from './core/logger.js';
import { logMessage } from './core/message-logger.js';
import qrcode from 'qrcode-terminal';

const logger = pino({ level: 'silent' });

class WhatsAppBot {
    private socket: WASocket | null = null;
    private pluginManager: PluginManager;
    private authPath: string = './auth';

    constructor() {
        this.pluginManager = new PluginManager();
    }

    async start() {
        Logger.boldGreen('🚀 Iniciando bot...');
        
        await this.pluginManager.loadPlugins();
        await this.connect();
    }

    private async connect() {
        const { state, saveCreds } = await useMultiFileAuthState(this.authPath);
        const { version } = await fetchLatestBaileysVersion();

        this.socket = makeWASocket({
            version,
            auth: state,
            logger: logger,
            browser: Browsers.ubuntu('Chrome'),
            markOnlineOnConnect: true,
        });

        this.socket.ev.on('creds.update', saveCreds);

        this.socket.ev.on('connection.update', (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                Logger.boldGreen('\nEscaneie o QR Code abaixo para conectar:\n');
                qrcode.generate(qr, { small: true });
                Logger.gray('\nAbra o WhatsApp > Configurações > Aparelhos Conectados > Conectar um aparelho\n');
            }

            if (connection === 'close') {
                const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
                const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

                Logger.error(`Conexão perdida pelo código: ${statusCode}`);
                Logger.gray(`Motivo? ${lastDisconnect?.error?.message || 'Desconhecido'}`);

                if (shouldReconnect) {
                    Logger.gray('Reconectando em 5s...');
                    setTimeout(() => this.connect(), 5000);
                } else {
                    Logger.error('Deslogado. Delete a pasta ./auth e reinicie.');
                }
            } else if (connection === 'open') {
                const id     = this.socket?.user?.id;
                const name = this.socket?.user?.name;
                Logger.boldGreen(`✓ Bot conectado com sucesso! ID: ${id} → Nome: ${name}`);
            }
        });

        this.socket.ev.on('messages.upsert', async (m) => {
            await this.handleMessage(m.messages[0]);
        });
    }

    private async handleMessage(message: WAMessage) {
        if (!this.socket || !message.key.remoteJid) return;
        if (message.key.fromMe) return;

        const context = new Context(this.socket, message);
        logMessage(context);
        await this.pluginManager.processMessage(context);
    }
}

const bot = new WhatsAppBot();
bot.start().catch(Logger.error);
