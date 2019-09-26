const Web3 = require('web3');
const Tx = require('ethereumjs-tx');
const web3 = new Web3(new Web3.providers.HttpProvider("https://rinkeby.infura.io/hM4sFGiBdqbnGTxk5YT2"));

const contractABI = '[{"constant":true,"inputs":[{"name":"C","type":"uint256"},{"name":"P0","type":"uint256"},{"name":"P1","type":"uint256"},{"name":"T","type":"uint256"},{"name":"y","type":"uint256"}],"name":"yToX","outputs":[{"name":"x","type":"uint256"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":true,"inputs":[{"name":"C","type":"uint256"},{"name":"P0","type":"uint256"},{"name":"P1","type":"uint256"},{"name":"T","type":"uint256"},{"name":"x","type":"uint256"}],"name":"xToY","outputs":[{"name":"y","type":"uint256"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":true,"inputs":[{"name":"M","type":"uint256"},{"name":"T0","type":"uint256"},{"name":"T","type":"uint256"}],"name":"getParamC","outputs":[{"name":"C","type":"uint256"}],"payable":false,"stateMutability":"pure","type":"function"},{"payable":true,"stateMutability":"payable","type":"fallback"}]';

// Notice: binData must startsWith 0x.
const binData = '0x608060405234801561001057600080fd5b506104ab806100206000396000f3fe6080604052600436106100345760003560e01c80631c5683f714610075578063bcdda460146100c9578063ea3c34031461010b575b60408051600160e51b62461bcd02815260206004820152600b6024820152600160aa1b6a155394d5541413d495115102604482015290519081900360640190fd5b34801561008157600080fd5b506100b7600480360360a081101561009857600080fd5b5080359060208101359060408101359060608101359060800135610141565b60408051918252519081900360200190f35b3480156100d557600080fd5b506100b7600480360360a08110156100ec57600080fd5b50803590602081013590604081013590606081013590608001356101f0565b34801561011757600080fd5b506100b76004803603606081101561012e57600080fd5b5080359060208101359060400135610287565b60008482101580156101535750838211155b6101965760408051600160e51b62461bcd0281526020600482015260096024820152600160b81b68696e76616c6964207902604482015290519081900360640190fd5b8482038585036101bc816101b08a8563ffffffff61035216565b9063ffffffff6103c416565b6101dc866101d0848663ffffffff61041f16565b9063ffffffff61035216565b816101e357fe5b0498975050505050505050565b6000828211156102395760408051600160e51b62461bcd0281526020600482015260096024820152600160bb1b680d2dcecc2d8d2c840f02604482015290519081900360640190fd5b84840361027c86610254866101b08b8863ffffffff61035216565b610268846101d0898963ffffffff61041f16565b8161026f57fe5b049063ffffffff6103c416565b979650505050505050565b6000610299848363ffffffff61035216565b6102ba6102ad86600163ffffffff6103c416565b859063ffffffff61035216565b11156103105760408051600160e51b62461bcd02815260206004820152601460248201527f54302f54206d757374203c3d204d2f284d2b3129000000000000000000000000604482015290519081900360640190fd5b61034a600161033e868661032a828863ffffffff61035216565b8161033157fe5b049063ffffffff61041f16565b9063ffffffff61041f16565b949350505050565b81810282158061036a57508183828161036757fe5b04145b6103be5760408051600160e51b62461bcd02815260206004820152600c60248201527f4d554c5f4f564552464c4f570000000000000000000000000000000000000000604482015290519081900360640190fd5b92915050565b818101828110156103be5760408051600160e51b62461bcd02815260206004820152600c60248201527f4144445f4f564552464c4f570000000000000000000000000000000000000000604482015290519081900360640190fd5b6000828211156104795760408051600160e51b62461bcd02815260206004820152600d60248201527f5355425f554e444552464c4f5700000000000000000000000000000000000000604482015290519081900360640190fd5b5090039056fea165627a7a7230582014b970e30dfbd338ba5cdefcae72c77dc1d189ada1036dbc89fdb54e87c86b440029';

// test account:
const privKey = "7c71142c72a019568cf848ac7b805d21f2e0fd8bc341e8314580de11c6a397bf";
const deployAddr = "0xe20cf871f1646d8651ee9dc95aab1d93160b3467";

// sign and send
// @param txData { nonce, gasLimit, gasPrice, to, from, value }
function sendSigned(txData, cb) {
  const privateKey = new Buffer(privKey, 'hex');
  const transaction = new Tx(txData);
  transaction.sign(privateKey);
  const serializedTx = transaction.serialize().toString('hex');
  console.log("serializedTx:", serializedTx);
  web3.eth.sendSignedTransaction('0x' + serializedTx, cb);
}

async function doDeploy() {
  const addressFrom = deployAddr;
  const myContract = new web3.eth.Contract(JSON.parse(contractABI));

  const txCount = await web3.eth.getTransactionCount(addressFrom);
  const contractBin = myContract.deploy({
    data: binData,
    // arguments: [''],
  }).encodeABI();

  console.log("contractBin:", contractBin);

  const txData = {
    nonce: web3.utils.toHex(txCount),
    gasLimit: web3.utils.toHex(6500000),
    gasPrice: web3.utils.toHex(5e9),
    from: addressFrom,
    data: contractBin,
  };

  sendSigned(txData, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log("deploy succeeded!");
    }
  });
}

doDeploy();