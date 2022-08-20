const { assert } = require("chai")
const { expect } = require("chai")
const { ethers } = require("hardhat")

const tokens = (amount) => {
   return ethers.utils.parseUnits(`${amount}`, "ether").toString()
}

describe("Exchange", ()=>{
    let exhange, accounts, deployer, feeAccount;
    const feePercent = 10;

    beforeEach(async ()=>{
        accounts = await ethers.getSigners();
        deployer = accounts[0];
        feeAccount = accounts[1];

        const Exchange = await ethers.getContractFactory("Exchange");
        exhange = await Exchange.deploy(feeAccount.address, feePercent);  
    })

    describe("Deployment",() => {
        
        it("tracks fee account", async() => {
           assert.equal(await exhange.feeAccount(), feeAccount.address);
        })
        it("tracks fee percentage", async() => {
            assert.equal(await exhange.feePercent(), feePercent);
         })
        
    })

})
