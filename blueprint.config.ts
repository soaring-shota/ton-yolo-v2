import { Config } from '@ton/blueprint';
import { ScaffoldPlugin } from 'blueprint-scaffold';

export const config: Config = {
    // config contents
    network: 'testnet',
    plugins: [new ScaffoldPlugin()],
};
