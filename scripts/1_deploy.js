// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const { ethers } = require("hardhat");
const hre = require("hardhat");

async function main() {
  console.log(`preparing deployment... .. ... \n`);
  //fetch contract to deploy
  const Token = await hre.ethers.getContractFactory("Token");
  const Exchange = await hre.ethers.getContractFactory("Exchange");

  const accounts = await ethers.getSigners();
  console.log(`accounts fetched: \n ${accounts[0].address}\n ${accounts[1].address}\n`);

  //deploy contract
  const exchange = await Exchange.deploy(accounts[1].address, 10);
  await exchange.deployed();
  console.log(`exchange deployed, address: ${exchange.address}`);
  
  const BCC = await Token.deploy("BitConnect","BCC",1000000);
  await BCC.deployed();
  console.log(`BitConnect Coin 'BCC' token adres: ${BCC.address}`);

  const HIP = await Token.deploy("HipBTC", "HIP", 1000000);
  await HIP.deployed();
  console.log(`HipBTC 'HIP' token adres: ${HIP.address}`);

  const FAC = await Token.deploy("Falcon Coin", "FAC", 1000000);
  await FAC.deployed();
  console.log(`Falcon Coin 'FAC' token adres: ${FAC.address}`);

  //run script and deploy on the blockchain use command line: npx hardhat  run --network localhost ./scripts/1_deploy.js

  /*
  const currentTimestampInSeconds = Math.round(Date.now() / 1000);
  const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
  const unlockTime = currentTimestampInSeconds + ONE_YEAR_IN_SECS;

  const lockedAmount = hre.ethers.utils.parseEther("1");

  const Lock = await hre.ethers.getContractFactory("Lock");
  const lock = await Lock.deploy(unlockTime, { value: lockedAmount });

  await lock.deployed();

  console.log("Lock with 1 ETH deployed to:", lock.address);
  */
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
