const { assert, use } = require("chai");
const { expect } = require("chai");
const { ethers } = require("hardhat");

const tokens = (amount) => {
   return ethers.utils.parseUnits(`${amount}`, "ether").toString()
}

describe("Exchange", ()=>{
    let exchange,token1, token2, accounts, deployer, feeAccount, user1;
    const feePercent = 10;

    beforeEach(async ()=>{
        accounts = await ethers.getSigners();
        deployer = accounts[0];
        feeAccount = accounts[1];
        user1 = accounts[2];

        const Exchange = await ethers.getContractFactory("Exchange");
        exchange = await Exchange.deploy(feeAccount.address, feePercent);  

        const Token = await ethers.getContractFactory("Token");
        token1 = await Token.connect(deployer).deploy("BitConnect", "BCC", tokens(10000));
    })

    describe("Deployment",() => {
        
        it("tracks fee account", async() => {
           assert.equal(await exchange.feeAccount(), feeAccount.address);
        })
        it("tracks fee percentage", async() => {
            assert.equal(await exchange.feePercent(), feePercent);
         })
        
    })

    describe("Deposit token to exchange", () => {
        let approve, amount, transaction,result;
        amount = tokens(1000);

        describe("success", ()=> {
            beforeEach(async () => {           
                token1.connect(deployer).transfer(user1.address, amount);
                //approve token icrease user1 allowance
                approve = await token1.connect(user1).approve(exchange.address, amount);

                //user1 send tokens to exchange contract
                transaction = await exchange.connect(user1).depositToken(token1.address, amount);
                result = await transaction.wait();
            })

            it("Exchange contract received deposit", async () => {
                //check if exchange contract receives amount
                assert.equal(await token1.balanceOf(exchange.address), amount);
            })
            it("tracks the amount user has stored on exchange",async ()=> {
                assert.equal(await exchange.tokenBalance(token1.address, user1.address), amount);
                assert.equal(await exchange.balanceOf(token1.address, user1.address), amount);
            })
            it("emits deposit event", async()=>{
                 assert.equal(result.events[1].event, "Deposit");

                 const args = result.events[1].args;
              //   console.log(args);   
                 assert.equal(args.token, token1.address);
                 assert.equal(args.user, user1.address);
                 assert.equal(args.amount, amount);
                 assert.equal(args.balance, amount);
            })
        })
        describe("Fail", () => {

            it("reverts without approval", async ()=>{
                await expect(exchange.connect(user1).depositToken(token1.address, amount)).to.be.reverted;
            })
        })
    })

})
