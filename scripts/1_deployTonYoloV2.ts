import { toNano, Address } from '@ton/core';
import { TonYoloV2 } from '../wrappers/TonYoloV2';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const tonYoloV2 = provider.open(
        TonYoloV2.createFromConfig(
            {
                numberOfRounds: 0,
                contractPaused: false,
                protocolFeeRecipient: Address.parse('0QCM4c41g1YiC-Qlh7yYdY8wLqS4sM5eWncLmH_aTgCthDbe'), // Example Address
                roundDuration: 120,
                valuePerEntry: BigInt("10000000000000000"),
                protocolFeeBp: 100,
                maximumNumberOfDepositsPerRound: 100000,
                maximumNumberOfParticipantsPerRound: 500 ,
                jettonAddr: Address.parse('EQBJ4La4gi6qAQqLl3-EC7M7D7bXUdFwVmMlUJNlgV5dES0H'),
                oracleAddr: Address.parse('EQBJ4La4gi6qAQqLl3-EC7M7D7bXUdFwVmMlUJNlgV5dES0H'),
                adminAddr: Address.parse('EQCM4c41g1YiC-Qlh7yYdY8wLqS4sM5eWncLmH_aTgCthNCR'),
            },
            await compile('TonYoloV2'),
        ),
    );

    await tonYoloV2.sendDeploy(provider.sender(), toNano('0.05'));
    await provider.waitForDeploy(tonYoloV2.address);
    
    // logging
    console.log('ID', await tonYoloV2.getStateValue());
}
