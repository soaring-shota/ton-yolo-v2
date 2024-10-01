import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Dictionary, Sender, SendMode } from '@ton/core';

export type TonYoloV2Config = {
    numberOfRounds: number;
    contractPaused: boolean;
    protocolFeeRecipient: Address;
    roundDuration: number;
    valuePerEntry: bigint;
    protocolFeeBp: number;
    maximumNumberOfDepositsPerRound: number;
    maximumNumberOfParticipantsPerRound: number;
    jettonAddr: Address;
    oracleAddr: Address;
    adminAddr: Address;
};

export function tonYoloV2ConfigToCell(config: TonYoloV2Config): Cell {
    const mainCell = beginCell()
        .storeDict(Dictionary.empty())
        .storeUint(config.numberOfRounds, 32)
        .storeUint(config.contractPaused ? 1 : 0, 1)
        .storeDict(Dictionary.empty())
        .storeAddress(config.protocolFeeRecipient)
        .storeUint(config.roundDuration, 32)
        .storeUint(config.valuePerEntry, 256)
        .storeUint(config.protocolFeeBp, 16)
        .storeUint(config.maximumNumberOfDepositsPerRound, 40)
        .storeUint(config.maximumNumberOfParticipantsPerRound, 40)
        .storeDict(Dictionary.empty());
    
    const additonalCell = beginCell()
        .storeAddress(config.jettonAddr)
        .storeAddress(config.oracleAddr)
        .storeAddress(config.adminAddr);

    return mainCell
        .storeRef(additonalCell)
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

    async getStateValue(provider: ContractProvider) {
        const {stack} = await provider.get('get_state_data', []);
        return {
            1: stack.pop(),
            2: stack.pop(),
            3: stack.pop(),
            4: stack.pop(),
            5: stack.pop(),
            6: stack.pop(),
            7: stack.pop(),
            8: stack.pop(),
            9: stack.pop(),
            10: stack.pop(),
            11: stack.pop(),
            12: stack.pop(),
            13: stack.pop(),
            14: stack.pop(),
        }
    }

    // async deposit(
    //     provider: ContractProvider,
    //     via: Sender,
    //     opts: {
    //         inMsg: Cell;
    //         roundId: number;
    //         deposits: Cell;
    //         value: bigint;
    //         queryID?: number;
    //     }
    // ) {
    //     const { inMsg, roundId, deposits, value, queryID } = opts;

    //     const body = beginCell()
    //         .storeUint(Opcodes.deposit, 32)    // Store the opcode for deposit
    //         .storeUint(queryID ?? 0, 64)       // Store optional query ID
    //         .storeRef(inMsg)                   // Store the in_msg as a reference
    //         .storeUint(roundId, 32)            // Store the roundId
    //         .storeRef(deposits)                // Store the deposits cell as a reference
    //         .endCell();

    //     await provider.internal(via, {
    //         value: value,
    //         sendMode: SendMode.PAY_GAS_SEPARATELY,
    //         body: body,
    //     });
    // }
    
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
