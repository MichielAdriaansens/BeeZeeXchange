const config = require("../src/config.json");
//const hre = require("hardhat");
const {ethers} = require("hardhat");

const tokens = (amount) => {
    return ethers.utils.parseUnits(`${amount}`, "ether").toString()
 }

const wait = (seconds) => {
    const milliseconds = seconds * 1000;
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

async function main(){
    let transaction, result;
    const accounts = await ethers.getSigners();

    //get network
    const {chainId} = await ethers.provider.getNetwork();
    console.log("using chain-id: ", chainId);

    //fetching contracts
    console.log("Fetching Tokens ...")
    const bcc = await ethers.getContractAt("Token", config[chainId].BCC.address);
    console.log(` token fetched: ${bcc.address}`);
    
    const hip = await ethers.getContractAt("Token", config[chainId].HIP.address);
    console.log(` token fetched: ${hip.address}`);
    
    const fac = await ethers.getContractAt("Token", config[chainId].FAC.address);
    console.log(` token fetched: ${fac.address}`);

    console.log(`\nFetching Exchange contract...`)
    const exchange = await ethers.getContractAt("Exchange", config[chainId].exchange.address);
    console.log(` exchange fetched: ${exchange.address}`);
    
    //set up users
    const deployer = accounts[0];
    const feeAccount = accounts[1];
    const user1 = accounts[2];
    const user2 = accounts[3];
    const amount = tokens(1000);

    //Distribute token
    console.log("\nDistributing tokens...");
    console.log(` token approval from: ${deployer.address}\n to: \n ${user1.address}\n ${user2.address}`)
    await bcc.connect(deployer).approve(user1.address, amount);
    await hip.connect(deployer).approve(user2.address, amount);
    await hip.connect(deployer).approve(user1.address, tokens(500));

    console.log(`\nTransferring tokens to users... `)
    await bcc.connect(deployer).transfer(user1.address, amount);
    console.log(` user1 received ${amount} BCC tokens`);
    
    await hip.connect(deployer).transfer(user2.address, amount);
    console.log(` user2 received ${amount} HIP tokens`);

    await hip.connect(deployer).transfer(user1.address, tokens(500));
    console.log(` user1 received ${amount} FAC tokens`);

    //Deposit tokens to exchange
    console.log(`\nDeposit Token to exchange`);

    await bcc.connect(deployer).approve(exchange.address, tokens(1500));
    await exchange.connect(deployer).depositToken(bcc.address, tokens(1500));
    console.log(` deployer deposited ${tokens(1500)} BCC to exchange`);

    await bcc.connect(user1).approve(exchange.address, amount);
    console.log(` Approved ${amount} tokens from: ${user1.address}`);

    await hip.connect(user1).approve(exchange.address, tokens(500));
    console.log(` Approved ${tokens(500)} tokens from: ${user1.address}`);

    await hip.connect(user2).approve(exchange.address, amount);
    console.log(` Approved ${amount} tokens from: ${user2.address}`);

    await exchange.connect(user1).depositToken(bcc.address, amount);
    console.log(` user1 deposited ${amount} BCC to exchange`);

    await exchange.connect(user1).depositToken(hip.address, tokens(500));
    console.log(` user1 deposited ${tokens(500)} BCC to exchange`);

    await exchange.connect(user2).depositToken(hip.address, amount);
    console.log(` user2 deposited ${amount} HIP to exchange\n`);

    //make order
    console.log("Making order...");
    transaction = await exchange.connect(user1).makeOrder(hip.address, tokens(100), bcc.address, tokens(5));
    result = await transaction.wait();
    console.log(` ${user1.address} placed an order`);

    //cancel order
    console.log(result.events[0].event);
    
    let orderId = result.events[0].args.id;
    await exchange.connect(user1).cancelOrder(orderId);
    console.log(`order cancelled by ${user1.address}`);

    await wait(1);
    console.log(1);
    await wait(1);
    console.log(2);
    await wait(1);
    console.log(3);

    //Make and filling order 
    console.log(`\nMaking order #2`);
    transaction = await exchange.connect(user1).makeOrder(hip.address, tokens(50), bcc.address, tokens(15));
    result = await transaction.wait();
    console.log(` ${user1.address} placed an order`);

    console.log(`\nFilling order...`);
    await exchange.connect(user2).fillOrder(result.events[0].args.id);
    console.log(` order #2 filled by ${user2.address}`);

    await wait(1);

    console.log(`\nMaking order #3`);
    transaction = await exchange.connect(user2).makeOrder(bcc.address, tokens(150), hip.address, tokens(40));
    result = await transaction.wait();
    console.log(` ${user2.address} placed an order`);

    console.log(`\nFilling order...`);
    await exchange.connect(user1).fillOrder(result.events[0].args.id);
    console.log(` order #3 filled by ${user1.address}\n`);

    await wait(1);

    console.log(`\nMaking order #4`);
    transaction = await exchange.connect(deployer).makeOrder(hip.address , tokens(250), bcc.address, tokens(100));
    result = await transaction.wait();
    console.log(` ${deployer.address} placed an order`);

    await wait(0.5);

    await exchange.connect(user1).fillOrder(result.events[0].args.id);
    console.log(` order #4 filled by ${user1.address}\n`);

    await wait(1);

    console.log(`\nMaking order #5`);
    transaction = await exchange.connect(deployer).makeOrder(hip.address , tokens(30), bcc.address, tokens(10));
    result = await transaction.wait();
    console.log(` ${deployer.address} placed an order`);

    await exchange.connect(user1).fillOrder(result.events[0].args.id);
    console.log(` order #4 filled by ${user1.address}\n`);

    await wait(1);
    /// Seed Orders
    //make 10 orders from deployer
    console.log(`\nMake 10 orders from user 1...`);
    for(let i = 1; i<=10; i++ ){
        await exchange.connect(deployer).makeOrder(hip.address, tokens(10 * i), bcc.address, tokens(10));
        await wait(1);
        
        console.log(` made order from ${deployer.address}`);
    }

    /*
    //make 10 orders from user 1
    console.log(`\nMake 10 orders from user 1...`);
    for(let i = 1; i<=10; i++ ){
        await exchange.connect(user1).makeOrder(hip.address, tokens(10 * i), bcc.address, tokens(10));
        await wait(1);
        
        console.log(` made order from ${user1.address}`);
    }
    */
   //make 10 orders from user 2
    console.log(`\nMake 10 orders from user 2...`);
    for(let i = 1; i<=10; i++ ){
        await exchange.connect(user2).makeOrder(bcc.address, tokens(10), hip.address, tokens(10 * i));
        await wait(1);
        
        console.log(`made order from ${user2.address}`);
    }

    await wait(1);
    console.log(`\n1`);
    await wait(1);
    console.log(`2`);
    await wait(1);
    console.log(`3\n`);

    await wait(2);
    console.log("Stake it 'till you break it!!\n\n");
    await wait(1);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });