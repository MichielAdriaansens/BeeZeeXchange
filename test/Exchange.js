const { assert } = require("chai");
const { expect } = require("chai");
const { ethers } = require("hardhat");

const tokens = (amount) => {
   return ethers.utils.parseUnits(`${amount}`, "ether").toString()
}

describe("Exchange", ()=>{
    let exchange,token1, token2, accounts, deployer, feeAccount, user1, user2;
    const feePercent = 10;

    beforeEach(async ()=>{
        accounts = await ethers.getSigners();
        deployer = accounts[0];
        feeAccount = accounts[1];
        user1 = accounts[2];
        user2 = accounts[3];

        const Exchange = await ethers.getContractFactory("Exchange");
        exchange = await Exchange.deploy(feeAccount.address, feePercent);  

        const Token = await ethers.getContractFactory("Token");
        token1 = await Token.connect(deployer).deploy("BitConnect", "BCC", tokens(10000));
        token2 = await Token.connect(user1).deploy("HipBTC", "HIP", tokens(10000) );
    })

    describe("Deployment",() => {
        
        it("tracks fee account", async() => {
           assert.equal(await exchange.feeAccount(), feeAccount.address);
        })
        it("tracks fee percentage", async() => {
            assert.equal(await exchange.feePercent(), feePercent);
         })
        
    })

    describe("Deposit tokens", () => {
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

            it("Contract received deposit", async () => {
                //check if exchange contract receives amount
                assert.equal(await token1.balanceOf(exchange.address), amount);
            })
            it("tracks the amount user has stored",async ()=> {
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

    describe("Withdraw tokens", () => {
        let transaction, result;
        let amount = tokens(100);

        beforeEach(async () => {
            await token1.connect(deployer).approve(user1.address , amount);
            await token1.connect(deployer).transfer(user1.address, amount);
            
            await token1.connect(user1).approve(exchange.address, amount);
            await exchange.connect(user1).depositToken(token1.address , amount);
            

            transaction = await exchange.connect(user1).withdrawToken(token1.address , amount);
            result = await transaction.wait();
        })

        describe("Success" , () => {

            it("Decreases balance of user", async () => {
                assert.equal(await exchange.balanceOf(token1.address, user1.address),0);
            })
            it("Emits withdraw event", async () => {
                assert.equal( await result.events[1].event, "Withdraw");
                
                let args = await result.events[1].args
                assert.equal(args.token, token1.address);
                assert.equal(args.user, user1.address);
                assert.equal(args.amount, amount); // checks the amount that is withdrawn
                assert.equal(args.balance, 0); //newamount is 0
            })
        })
        describe("Fail", () => {
            let amount = tokens(10);

            it("reverts transaction balance too low", async () => {
               await expect(exchange.connect(user1).withdrawToken(token1.address, amount + tokens(1))).to.be.reverted;
            })
        })

    })

    describe("Checks user balance", ()=>{
        let userBalance, amount;
        amount = tokens(10);

        beforeEach(async () => {
            //approve
            await token1.connect(deployer).approve(exchange.address, amount);
            //deposit
            await exchange.connect(deployer).depositToken(token1.address, amount);
            //return balance
            userBalance = await exchange.balanceOf(token1.address, deployer.address);
            
        })

        it("returns token balance of an account on exchange", async () => {
           assert.equal(userBalance, amount);
        })

    })

    describe("Place order", () => {
        let transaction, result;
        let amount = tokens(100);

        beforeEach(async () => {
            await token1.approve(exchange.address, amount);
            await exchange.depositToken(token1.address, amount);
        })
        
        describe("Success", () => {
            beforeEach(async () => {

                transaction = await exchange.connect(deployer).makeOrder(token2.address, tokens(20), token1.address, tokens(20));
                result = await transaction.wait();
            })

            it("tracks amount of orders", async ()=> {
                assert.equal(await exchange.orderCount(), 1);
            })

            it("emits an event", async () => {
                let args = result.events[0].args;
                
                assert.equal(await result.events[0].event, "Order");
               // console.log(args);
                assert.equal(await args.id, 1);
                assert.equal(await args.tokenGet,token2.address);
                assert.equal(await args.amountGet, tokens(20));
                assert.equal(await args.tokenGive, token1.address);
                assert.equal(await args.amountGive, tokens(20));
                expect(await args.timeStamp).to.at.least(1);
            })
        })
        describe("Fail", () => {
            it("reverts when balance is insufficient", async () => {
                await expect(exchange.connect(deployer).makeOrder(token2.address, tokens(20), token1.address, amount + tokens(20))).to.be.reverted;
            })

        })
    })

    describe("Order actions", () => {
        let transaction, result;
        let amount = tokens(10);

        beforeEach(async() => {
            await token1.connect(deployer).approve(exchange.address, amount);
            await exchange.connect(deployer).depositToken(token1.address, amount);
            await exchange.connect(deployer).makeOrder(token2.address, amount, token1.address, amount);
        })
        
        describe("Cancel Orders", () => {
            describe("Success", () => {
                beforeEach(async () => {
                    //cancel
                    transaction = await exchange.connect(deployer).cancelOrder(1);
                    result = await transaction.wait();
                })
                it("updates cancelled orders", async () =>{
                    assert.equal(await exchange.ordersIdCancelled(1), true);
                })
                it("emits event", async () => {
                    let args = result.events[0].args;
                
                    assert.equal(result.events[0].event, "Cancel");
                   // console.log(args);
                    assert.equal(args.id, 1);
                    assert.equal(args.tokenGet,token2.address);
                    assert.equal(args.amountGet,amount);
                    assert.equal(args.tokenGive, token1.address);
                    assert.equal(args.amountGive, amount);
                    expect(args.timeStamp).to.at.least(1);
                })
    
            })
            describe("Fail", () => {
                it("reverts false id input", async () => {
                    const invalidId = 0;
                    await expect(exchange.cancelOrder(invalidId)).to.be.reverted;  
                })
                it("reverts when invalid user cancels order", async() =>{
                    await expect(exchange.connect(user1).cancelOrder(1)).to.be.reverted;
                })
            })
        })

        describe("complete Orders", () =>{

            beforeEach(async () => {
                //user1 --holds token2. make order
                await token2.connect(user1).approve(exchange.address, amount);
                await exchange.connect(user1).depositToken(token2.address, amount);
                
                //placeOrder 
                await exchange.connect(user1).makeOrder(token1.address, amount, token2.address, amount); 
                
                //give user2 token1 to trade with
                await token1.connect(deployer).approve(user2.address, amount + amount);
                await token1.connect(deployer).transfer(user2.address, tokens(20));
                
                //user2 approve/deposit tokens to exchange
                await token1.connect(user2).approve(exchange.address, tokens(20));
                await exchange.connect(user2).depositToken(token1.address, tokens(20));
 
            })
            describe("Success", () =>{
                beforeEach(async () => {
                    //console.log(await exchange.orderList(2));
                    transaction = await exchange.connect(user2).fillOrder(2);
                    result = await transaction.wait();
                })

                it("executes trade and charges fees", async () =>{
                    //balance of user2 after paying token + fee
                    assert.equal(await exchange.balanceOf(token1.address, user2.address), tokens(9));
                    assert.equal(await exchange.balanceOf(token2.address, user2.address), amount);
                    
                    //balance of user 1
                    assert.equal(await exchange.balanceOf(token1.address, user1.address), amount);
                    assert.equal(await exchange.balanceOf(token2.address, user1.address), 0);
                    
                    //balance of fee account
                    assert.equal(await exchange.balanceOf(token1.address, feeAccount.address), tokens(1));
                })

                it("Tracks if order is filled", async() => {
                    assert.equal(await exchange.ordersIdCompleted(2), true);
                })

                it("emits an event",async () => {
                // console.log(result.events[0].event);
                    assert.equal(result.events[0].event, "Trade");

                    let args = result.events[0].args;
                //  console.log(args); 
                    assert.equal(args.id, 2);
                    assert.equal(args.user, user2.address);
                    assert.equal(args.tokenGet, token1.address);
                    assert.equal(args.amountGet, amount);
                    assert.equal(args.tokenGive, token2.address);
                    assert.equal(args.amountGive, amount);
                    assert.equal(args.creator, user1.address);
                    expect(args.timeStamp).to.at.least(1);
                })
            })
            describe("Fail", () => {
                it("reverts invalid id", async () => {
                    await expect( exchange.connect(user2).fillOrder(0)).to.be.reverted;
                })
                it("reverts if order allready filled", async ()=>{
                    //1st call order(2)
                    await exchange.connect(user2).fillOrder(2);
                    //2d call order(2)
                    await expect(exchange.connect(user2).fillOrder(2)).to.be.reverted;
                })
                it("reverts when order has been cancelled",async ()=>{
                    await exchange.connect(user1).cancelOrder(2);
                    //console.log(await exchange.ordersIdCancelled(2));
                    await expect(exchange.connect(user2).fillOrder(2)).to.be.reverted;
                })
            })
        })
    })
})
