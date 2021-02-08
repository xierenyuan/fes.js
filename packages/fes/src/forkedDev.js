import { chalk, yParser } from '@umijs/utils';
import { Service } from './serviceWithBuiltIn';
import getCwd from './utils/getCwd';
import getPkg from './utils/getPkg';

const args = yParser(process.argv.slice(2));

let closed = false;
function onSignal(signal, service) {
    if (closed) return;
    closed = true;

    // 退出时触发插件中的onExit事件
    service.applyPlugins({
        key: 'onExit',
        type: service.ApplyPluginsType.event,
        args: {
            signal
        }
    });
    process.exit(0);
}

(async () => {
    try {
        process.env.NODE_ENV = 'development';
        process.env.FES_ENV = args.mode || '';
        const service = new Service({
            cwd: getCwd(),
            pkg: getPkg(process.cwd())
        });
        await service.run({
            name: 'dev',
            args
        });


        // kill(2) Ctrl-C
        process.once('SIGINT', () => onSignal('SIGINT', service));
        // kill(3) Ctrl-\
        process.once('SIGQUIT', () => onSignal('SIGQUIT', service));
        // kill(15) default
        process.once('SIGTERM', () => onSignal('SIGTERM', service));
    } catch (e) {
        console.error(chalk.red(e.message));
        console.error(e.stack);
        process.exit(1);
    }
})();
