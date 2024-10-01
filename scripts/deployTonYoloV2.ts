import { toNano, Address } from '@ton/core';
import { TonYoloV2 } from '../wrappers/TonYoloV2';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const tonYoloV2 = provider.open(
        TonYoloV2.createFromConfig(
            {
                contractPaused: false,
                protocolFeeRecipient: Address.parse('0QCM4c41g1YiC-Qlh7yYdY8wLqS4sM5eWncLmH_aTgCthDbe'), // Example Address
                roundDuration: 120,
                valuePerEntry: BigInt("10000000000000000"),
                protocolFeeBp: 100,
                maximumNumberOfDepositsPerRound: 100000,
                maximumNumberOfParticipantsPerRound: 500 ,
            },
            await compile('TonYoloV2'),
        ),
    );

    await tonYoloV2.sendDeploy(provider.sender(), toNano('0.05'));
    await provider.waitForDeploy(tonYoloV2.address);
    // logging
    // console.log('ID', await tonYoloV2.getID());
}
