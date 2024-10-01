import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';

export type TonYoloV2Config = {
    contractPaused: boolean;
    protocolFeeRecipient: Address;
    roundDuration: number;
    valuePerEntry: bigint;
    protocolFeeBp: number;
    maximumNumberOfDepositsPerRound: number;
    maximumNumberOfParticipantsPerRound: number;
};

export function tonYoloV2ConfigToCell(config: TonYoloV2Config): Cell {
    return beginCell()
        .storeUint(config.contractPaused ? 1 : 0, 1) // Store contractPaused as unsigned 1-bit integer
        .storeAddress(config.protocolFeeRecipient)   // Store protocolFeeRecipient as an address
        .storeUint(config.roundDuration, 32)         // Store roundDuration as unsigned 32-bit integer
        .storeUint(config.valuePerEntry, 256)        // Store valuePerEntry as unsigned 256-bit integer
        .storeUint(config.protocolFeeBp, 16)         // Store protocolFeeBp as unsigned 16-bit integer
        .storeUint(config.maximumNumberOfDepositsPerRound, 40) // Store maximumNumberOfDepositsPerRound as unsigned 40-bit integer
        .storeUint(config.maximumNumberOfParticipantsPerRound, 40) // Store maximumNumberOfParticipantsPerRound as unsigned 40-bit integer
        .endCell();  
}

export const Opcodes = {
    increase: 0x7e8764ef,
};

export class TonYoloV2 implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new TonYoloV2(address);
    }

    static createFromConfig(config: TonYoloV2Config, code: Cell, workchain = 0) {
        const data = tonYoloV2ConfigToCell(config);
        const init = { code, data };
        return new TonYoloV2(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async deposit(
        provider: ContractProvider,
        via: Sender,
        opts: {
            inMsg: Cell;
            roundId: number;
            deposits: Cell;
            value: bigint;
            queryID?: number;
        }
    ) {
        const { inMsg, roundId, deposits, value, queryID } = opts;

        const body = beginCell()
            .storeUint(Opcodes.deposit, 32)    // Store the opcode for deposit
            .storeUint(queryID ?? 0, 64)       // Store optional query ID
            .storeRef(inMsg)                   // Store the in_msg as a reference
            .storeUint(roundId, 32)            // Store the roundId
            .storeRef(deposits)                // Store the deposits cell as a reference
            .endCell();

        await provider.internal(via, {
            value: value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: body,
        });
    }
    
    // async sendIncrease(
    //     provider: ContractProvider,
    //     via: Sender,
    //     opts: {
    //         increaseBy: number;
    //         value: bigint;
    //         queryID?: number;
    //     }
    // ) {
    //     await provider.internal(via, {
    //         value: opts.value,
    //         sendMode: SendMode.PAY_GAS_SEPARATELY,
    //         body: beginCell()
    //             .storeUint(Opcodes.increase, 32)
    //             .storeUint(opts.queryID ?? 0, 64)
    //             .storeUint(opts.increaseBy, 32)
    //             .endCell(),
    //     });
    // }

    // async getCounter(provider: ContractProvider) {
    //     const result = await provider.get('get_counter', []);
    //     return result.stack.readNumber();
    // }

    // async getID(provider: ContractProvider) {
    //     const result = await provider.get('get_id', []);
    //     return result.stack.readNumber();
    // }
}
