// require('dotenv').config();
// const HDWalletProvider = require('truffle-hdwallet-provider');
// const mnemonic = process.env.MNEMONIC;
// let hdWallet = new HDWalletProvider(mnemonic, `https://ropsten.infura.io/v3/${process.env.INFURA_API_KEY}`, 0, 10);

// console.log(hdWallet.getAddresses());

// const { toBytes32 } = require('.');
const fs = require('fs');
const path = require('path');
const Web3 = require('web3');
const Tx = require('ethereumjs-tx').Transaction;
const BN = require('bn.js');
const Common = require('ethereumjs-common').default;


const network = 'kovan';
// 'https://kovan.infura.io/v3/d5769809a53a4db0ac23801e3e1aa168'
let web3 = new Web3(`http://3.81.26.93:8080/ropstenWeb3/jsonrpc/ZitZB2VMh2ZxnTSy9BB95JIqtEItXC`);
let synthContract = JSON.parse(fs.readFileSync(path.join(process.cwd(), '/build/contracts/Synthetix.json')))
let synthetixContractAddress = '0xF498A9D6301233d768615C108CF6898C7F1D8656';
let resolverAddress = '0x7d1BcC09D9c2d68e55bc2508C5fC7772549890FA';
let ownerAddress = '0xe4652e66B07EE600ecf72D92c2D0CA13135d5173';
let ownerPrivateKey = Buffer.from('563A1FB4F5BD9EA6271D1A7AAEECCAE5806FFAEFD35B25265B59A381A084F3D9', 'hex');
let systemStatusAsHex = '0x53797374656d5374617475730000000000000000000000000000000000000000';

let transferTokens = async () => {
    let synthContractInstance = new web3.eth.Contract(synthContract.abi, synthetixContractAddress);
    let to = '0xC2360503458Ae653b839A5dfD40713dFeB8a0036';
    let value = '11';
    let data = synthContractInstance.methods.transfer(to, value).encodeABI();
    let txHash = await sendTransaction(ownerAddress, synthetixContractAddress, data, null, ownerPrivateKey, null)
    if (!txHash) {
        console.log('transaction was not sent');
    } else {
        console.log(txHash);
    }
}

let query = async () => {
    console.log(await web3.eth.getBlockNumber());

}

let sendTransaction = async (from, to, data, value, privKey, network) => {

    let nonce = await getNonce(from);
    let gasPrice = await web3.eth.getGasPrice();
    let gasAmount;
    try {
        gasAmount = await web3.eth.estimateGas({ from, to, data });
    } catch (ex) {
        console.log('gas estimation failed');
        console.log(ex);
        return;
    }
    let rawTx = {
        nonce: nonce,
        gasPrice: '0x' + web3.utils.toBN(gasPrice).toString('hex'),
        to,
        value: value ? value : '0x0',
        data: data ? data : '0x',
        gasLimit: '0x' + web3.utils.toBN(gasAmount).toString('hex')
    }
    let tx;
    if (network) {
        tx = new Tx(rawTx, { 'chain': network });
    } else {
        let customCommon = Common.forCustomChain(
            'mainnet',
            {
                name: 'my-network',
                networkId: 15,
                chainId: 15,
            },
            'petersburg',
        )
        tx = new Tx(rawTx, { common: customCommon });
    }
    tx.sign(privKey);
    let serializedTx = tx.serialize();
    let receipt;
    try {
        receipt = await web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'));
    } catch (ex) {
        console.log('error, transaction was not sent');
        console.log(ex);
        return;
    }
    return receipt.transactionHash;
};

let localNonces = {};
let getNonce = async (address) => {

    let nonce = await web3.eth.getTransactionCount(address);
    if (!localNonces[address]) {
        localNonces[address] = 0;
    }
    localNonces[address] = Math.max(nonce, localNonces[address] + 1);
    return localNonces[address];
};
let toBytes32 = (key) => {
    return web3.utils.rightPad(web3.utils.asciiToHex(key), 64);
}
// mappingSlot, key = hex string
let getSlotForMapping = (mappingSlot, key) => {
    let mappingSlotPadded = web3.utils.leftPad((mappingSlot).replace('0x', ''), 64, '0');
    let keyPadded = web3.utils.leftPad((key).replace('0x', ''), 64, '0');
    return web3.utils.sha3('0x' + keyPadded.concat(mappingSlotPadded), { encoding: 'hex' });
};
// arraySlot, index, elementSize = BN
let getSlotForArray = (arraySlot, index, elementSize) => {
    arraySlot = arraySlot.toString('hex');
    let arraySlotPadded = web3.utils.leftPad((arraySlot).replace('0x', ''), 64, '0');
    const TWO_POW256 = new BN('115792089237316195423570985008687907853269984665640564039457584007913129639936', 10);
    let arraySlotHash = new BN(web3.utils.sha3('0x' + arraySlotPadded, { encoding: 'hex' }), 'hex');
    let slotBN = arraySlotHash.add(index.mul(elementSize).mod(TWO_POW256)).mod(TWO_POW256);
    return slotBN.toString('hex');
}


let setResolverAndSyncCache = async () => {
    let synthInstance = new web3.eth.Contract(synthContract.abi, synthetixContractAddress);
    let data = synthInstance.methods.setResolverAndSyncCache(resolverAddress).encodeABI();
    let txHash = await sendTransaction(ownerAddress, synthetixContractAddress, null, data, ownerPrivateKey, network)
    if (!txHash) {
        console.log('transaction was not sent');
    } else {
        console.log(txHash);
    }
};

let importAddresses = async () => {
    let encodedArray = [
        'DelegateApprovals',
        'Depot',
        'EtherCollateral',
        'Exchanger',
        'ExchangeRates',
        'ExchangeState',
        'FeePool',
        'FeePoolEternalStorage',
        'FeePoolState',
        'Issuer',
        'IssuanceEternalStorage',
        'RewardEscrow',
        'RewardsDistribution',
        'SupplySchedule',
        'Synthetix',
        'SynthetixEscrow',
        'SynthetixState',
        'SynthsETH',
        'SynthsUSD',
        'SystemStatus',
    ].map(toBytes32);

    let addresses =
        [
            delegateApprovals.address,
            depot.address,
            etherCollateral.address,
            exchanger.address,
            exchangeRates.address,
            exchangeState.address,
            feePool.address,
            feePoolEternalStorage.address,
            feePoolState.address,
            issuer.address,
            issuanceEternalStorage.address,
            rewardEscrow.address,
            rewardsDistribution.address,
            supplySchedule.address,
            synthetix.address,
            escrow.address,
            synthetixState.address,
            sETHSynth.synth.address,
            sUSDSynth.synth.address,
            systemStatus.address,
        ]
};

let testLocalNet = async () => {
    // let txHash = await sendTransaction('0xe64E04CE8fd663C833cd33f6369EC2092d8B14C8', ownerAddress, null, '0x3782DACE9D900000',
    //     Buffer.from('030F3ED42A0007F245DFAF8D15C54897BE6FAE9D003DBCD035833018E4AF431F', 'hex'))
    // if (!txHash) {
    //     console.log('transaction was not sent');
    // } else {
    //     console.log(txHash);
    // }
    let web3 = new Web3(`http://3.81.26.93:8080/ropstenWeb3/jsonrpc/ZitZB2VMh2ZxnTSy9BB95JIqtEItXC`);
    console.log(await web3.eth.getBlockNumber());

}

let checkTokenBalance = async () =>{
    let synthContractInstance = new web3.eth.Contract(synthContract.abi, synthetixContractAddress);
    let res = await synthContractInstance.methods.balanceOf(ownerAddress).call();
    console.log(res);
}


// checkTokenBalance();
// 0x205d47c913023b352bfdbbaec4feba8e4f3cc46d9224f920271fd92e32963c7f --> transfer of 11 synthetix tokens
// transferTokens()
// testLocalNet()
