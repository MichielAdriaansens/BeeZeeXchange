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
    const user1 = accounts[0];
    const user2 = accounts[1];
    const amount = tokens(1000);

    console.log(`deployer has BCC: `, await bcc.balanceOf(deployer.address));
    console.log(`deployer has HIP: `, await hip.balanceOf(deployer.address));
    console.log(`deployer has FAC:`, await fac.balanceOf(deployer.address));
/*
    //Distribute token
    console.log("\nDistributing tokens...");
    console.log(` token approval from: ${deployer.address}\n to: ${user2.address}`)
    await bcc.connect(deployer).approve(user2.address, amount);
    await hip.connect(deployer).approve(user2.address, amount);
    await fac.connect(deployer).approve(user2.address, amount);

    await wait(1);

    console.log(`\nTransferring tokens to users... `)
    await bcc.connect(deployer).transfer(user2.address, amount);
    console.log(` user2 received ${amount} BCC tokens`);
    
    await hip.connect(deployer).transfer(user2.address, amount);
    console.log(` user2 received ${amount} HIP tokens`);

    await fac.connect(deployer).transfer(user2.address, amount);
    console.log(` user2 received ${amount} FAC tokens`);

    //Deposit tokens to exchange
    console.log(`\nDeposit Token to exchange`);

    await bcc.connect(user1).approve(exchange.address, amount);
    console.log(` Approved ${amount} tokens from: ${user1.address}`);
    await exchange.connect(user1).depositToken(bcc.address, amount);
    console.log(` user1 deposited ${amount} BCC to exchange`);

    console.log(`\n`);

    await hip.connect(user1).approve(exchange.address, amount);
    console.log(` Approved ${amount} tokens from: ${user1.address}`);
    await exchange.connect(user1).depositToken(hip.address, amount);
    console.log(` user1 deposited ${amount} HIP to exchange`);

    console.log(`\n`);
    await fac.connect(user1).approve(exchange.address, amount);
    console.log(` Approved ${amount} tokens from: ${user1.address}`);
    await exchange.connect(user1).depositToken(fac.address, amount);
    console.log(` user1 deposited ${amount} FAC to exchange`);

    await wait(1);
    console.log(`... \n`);

    await hip.connect(user2).approve(exchange.address, amount);
    console.log(` Approved ${amount} tokens from: ${user2.address}`);
*/    
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
    transaction = await exchange.connect(deployer).makeOrder(bcc.address , tokens(30), hip.address, tokens(10));
    result = await transaction.wait();
    console.log(` ${deployer.address} placed an order`);

    await exchange.connect(user1).fillOrder(result.events[0].args.id);
    console.log(` order #5 filled by ${user1.address}\n`);

    await wait(1);

    console.log(`\nMaking order #6`);
    transaction = await exchange.connect(deployer).makeOrder(hip.address , tokens(30), bcc.address, tokens(10));
    result = await transaction.wait();
    console.log(` ${deployer.address} placed an order`);

    await exchange.connect(user1).fillOrder(result.events[0].args.id);
    console.log(` order #6 filled by ${user1.address}\n`);

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