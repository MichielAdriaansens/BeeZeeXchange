const config = require("../src/config.json");

const {ethers} = require("hardhat");

const tokens = (amount) => {
    return ethers.utils.parseUnits(`${amount}`, "ether").toString()
 }

async function main(){
    const accounts = await ethers.getSigners();
    
    const {chainId} = await ethers.provider.getNetwork();
    console.log('chainId: ', chainId);

    console.log(`\n`);
    
    //LOAD TOKENS
    const bcc = await ethers.getContractAt("Token", config[chainId].BCC.address);
    console.log('BCC till we die baby, ', bcc.address);

    const hip = await ethers.getContractAt("Token", config[chainId].HIP.address);
    console.log('Hip BTC! Hip BTC!! ', hip.address);

    const fac = await ethers.getContractAt("Token", config[chainId].FAC.address);
    console.log('FALCON COIN! FALCON COIN!! ', fac.address);

    console.log(`\n`);

    //LOAD EXCHANGE
    const exchange = await ethers.getContractAt("Exchange", config[chainId].exchange.address);
    console.log('exchange contract: ', exchange.address);

    const deployer = accounts[0];
    const user1 = accounts[1];

    await bcc.connect(deployer).approve(user1.address, tokens(1000));
    await bcc.connect(deployer).transfer(user1.address, tokens(1000));

    await hip.connect(deployer).approve(user1.address, tokens(1000));
    await hip.connect(deployer).transfer(user1.address, tokens(1000));

    await fac.connect(deployer).approve(user1.address, tokens(1000));
    await fac.connect(deployer).transfer(user1.address, tokens(1000));

    await bcc.connect(deployer).approve(exchange.address, (tokens(1000)));
    await hip.connect(deployer).approve(exchange.address, (tokens(1000)));
    await fac.connect(deployer).approve(exchange.address, (tokens(1000)));

    await bcc.connect(user1).approve(exchange.address, (tokens(1000)));
    await hip.connect(user1).approve(exchange.address, (tokens(1000)));
    await fac.connect(user1).approve(exchange.address, (tokens(1000)));

    await exchange.connect(deployer).depositToken(bcc.address, tokens(100));
    await exchange.connect(deployer).depositToken(hip.address, tokens(100));

    await exchange.connect(user1).depositToken(bcc.address, tokens(100));
    await exchange.connect(user1).depositToken(hip.address, tokens(100));
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
})