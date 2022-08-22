const { assert } = require("chai")
const { expect } = require("chai")
const { ethers } = require("hardhat")

const tokens = (amount) => {
   return ethers.utils.parseUnits(`${amount}`, "ether").toString()
}

describe("Token", ()=>{
    let token, accounts;

    beforeEach(async ()=>{
        //fetch the Token Contract
        const Token = await ethers.getContractFactory("Token") //dit is een referentie naar het Contract.
        token = await Token.deploy("BitConnect","BCC",1000000) //om goed te testen moet je het contract eerst deployen. 
        accounts = await ethers.getSigners();
    })

    describe("Deployment",() => {
        const name = "BitConnect"
        const symbol = "BCC"
        const decimal = 10**18
        const tSupply = tokens(1000000)

        //Test Yo Ssshit boii.
        it("has name",async ()=>{
            assert.equal(await token.name(),name)
            console.log(`contract name: ${name}`)

        })
        it("has symbol", async () => {
            assert.equal(await token.symbol(), symbol)
            console.log(`contract symbol: ${await token.symbol()}`);
        })
        it("has decimals", async () => {
            assert.equal(await token.decimals(), decimal)
            console.log(await token.decimals());
        })
        it("has total supply", async () => { 
        // expect(await token.totalSupply()).to.equal(value)
            assert.equal(await token.totalSupply(), tSupply) //..assert*werkt wel, value omzetten naar string:p
            console.log(await token.totalSupply());
        })
        it("assigns total supply to deployer", async () => { 
            // expect(await token.totalSupply()).to.equal(value)
                assert.equal(await token.balanceOf(accounts[0].address), tSupply) //..assert*werkt wel, value omzetten naar string:p
                console.log(await token.balanceOf(accounts[0].address));
            })
        
    })

    describe("Transfer Tokens", () =>{
        let amount, transaction, result;
       
        beforeEach(async() => {
            amount = tokens("1000");

            //call transfer function.. uses default account
            // use a different account 
            // token.connect('address').transfer(...)
            transaction = await token.transfer(accounts[1].address , amount);
            
            //transaction.wait() zorgt ervoor dat je de receipt krijgt
            result = await transaction.wait();

        })
        describe("Success",() => {
            it("transfers Tokens",async ()=>{
                //check if token got sent
                assert.equal(await token.balanceOf(accounts[1].address), amount);
                assert.equal(await token.balanceOf(accounts[0].address), tokens(1000000 - 1000));
           //     console.log("receiver: " + (await token.balanceOf(accounts[1].address)));
           //     console.log("sender: " + (await token.balanceOf(accounts[0].address)));
            })
    
            it("emits an event", async () => {
               // console.log(result.events[0].args);
                assert.equal(result.events[0].event, "Transfer");
    
                //check the args..arguments..input vd transfer functie opgeslagen in events
                assert.equal(result.events[0].args._from, accounts[0].address);
                assert.equal(result.events[0].args._to , accounts[1].address);
                assert.equal(result.events[0].args._value, amount);
            })
        })
        describe("Failure",() => {
            //expect(...).to.be.reverted is een controle voor falen van require statements
            it("rejects isufficient funds", async() => {
               await expect(token.transfer(accounts[1].address, tokens(10000000))).to.be.reverted;
            })
            it("rejects invalid address", async () => {
                await expect(token.transfer("0x0000000000000000000000000000000000000000", amount)).to.be.reverted
            })
        })

    })

    describe("Approval of transfer", () => {
        let amount, transaction, result, exchangeAdr;
        amount = tokens(100000);
        
        beforeEach(async () =>{
            exchangeAdr = accounts[2].address;

            transaction = await token.approve(exchangeAdr, amount);
            result = await transaction.wait();
        }) 
        describe("Success", () => {
            it("gives allowance for authorised spending", async () => {
                assert.equal(await token.allowance(accounts[0].address, exchangeAdr), amount);
                
            })
            it("emits an event", async () =>{
               // console.log(result.events[0].args);
               assert.equal(result.events[0].event, "Approval");
               assert.equal(result.events[0].args._owner, accounts[0].address);
               assert.equal(result.events[0].args._spender, exchangeAdr);
               assert.equal(result.events[0].args._value, amount);
            })
  
        })
        describe("failure", () => {
            it("rejects invalid address", async () => {
                
                await expect(token.approve("0x0000000000000000000000000000000000000000", amount)).to.be.reverted;
            })
            
            it("rejects value higher than owner's balance",async () =>{
                let wrongAmount = await token.balanceOf(accounts[0].address) + 1;
                
                await expect(token.approve(exchangeAdr, wrongAmount)).to.be.reverted;
            })
            
        })
    })

    describe("Transfer tokens from account that gave permission", () => {
        let transaction, result, amount;
        let owner, spender, receiver;
        
        beforeEach(async () =>{
            amount = tokens(100000);
            // owner = accounts[0]; // receiver = accounts[1]; // spender = accounts[2];
            [owner, receiver, spender] = accounts;   

            //connect() gebruikt het account.. dus niet address!!
            approve = await token.connect(owner).approve(spender.address, amount);
        })

        describe("Success", () =>{
            beforeEach(async () =>{
                transaction = await token.connect(spender).transferFrom(owner.address,receiver.address,amount);
                result = await transaction.wait();
            })

            it("has transferred tokens", async ()=> {
                assert.equal(await token.balanceOf(receiver.address),amount);
                assert.equal(await token.balanceOf(owner.address), tokens(1000000) - amount);
            })
            it("emits event", async ()=> {
              //  console.log(result.events[0].args);
                assert.equal(result.events[0].args._from, owner.address);
                assert.equal(result.events[0].args._to, receiver.address);
                assert.equal(result.events[0].args._value, amount);
            })

        })
        describe("Failure", () =>{
            it("reverts call when amount is higher than allowance", async()=> {
                await expect(token.connect(spender).transferFrom(owner.address,receiver.address, tokens(200000))).to.be.reverted;
            })
            /*
            it("reverts when amount is higher than owner balance", async() => {
                await expect(token.connect(spender).transferFrom(owner.address,receiver.address, tokens(1000001))).to.be.reverted;
            })
            */
            it("reverts call on invalid address", async() => {
                await expect(token.transferFrom(owner.address, "0x0000000000000000000000000000000000000000", amount)).to.be.reverted;
            })
        })
    })
})
