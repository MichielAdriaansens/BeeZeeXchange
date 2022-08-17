const { assert } = require("chai")
const { expect } = require("chai")
const { ethers } = require("hardhat")

const tokens = (_amount) => {
   return ethers.utils.parseUnits(`${_amount}`, "ether").toString()
}

describe("Token", ()=>{
    let token, accounts;

    beforeEach(async ()=>{
        //fetch the Token Contract
        const Token = await ethers.getContractFactory("Token") //dit is een referentie naar het Contract.
        token = await Token.deploy("NiggaToken","NT",1000000) //om goed te testen moet je het contract eerst deployen. 
        accounts = await ethers.getSigners();
    })

    describe("Deployment",() => {
        const name = "NiggaToken"
        const symbol = "NT"
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

    describe("transfer Tokens", () =>{
        let _amount, transaction, result;
       
        beforeEach(async() => {
            _amount = tokens("1000");

            //call transfer function.. uses default account
            transaction = await token.transfer(accounts[1].address , _amount);
            
            //transaction.wait() zorgt ervoor dat je de receipt krijgt
            result = await transaction.wait();
            
            // use a different account 
            // token.connect('address').transfer(...)
        })
        describe("success",() => {
            it("transfers Tokens",async ()=>{
                //check if token got sent
                assert.equal(await token.balanceOf(accounts[1].address), _amount);
                assert.equal(await token.balanceOf(accounts[0].address), tokens(1000000 - 1000));
                console.log("receiver: " + (await token.balanceOf(accounts[1].address)));
                console.log("sender: " + (await token.balanceOf(accounts[0].address)));
            })
    
            it("emits an event", async () => {
               // console.log(result.events[0].args);
                assert.equal(result.events[0].event, "Transfer");
    
                //check the args..arguments..input vd transfer functie opgeslagen in events
                assert.equal(result.events[0].args._from, accounts[0].address);
                assert.equal(result.events[0].args._to , accounts[1].address);
                assert.equal(result.events[0].args._value, _amount);
            })
        })
        describe("fail",() => {
            //expect(...).to.be.reverted is een controle voor falen van require statements
            it("rejects isufficient funds", async() => {
               await expect(token.transfer(accounts[1].address, tokens(10000000))).to.be.reverted;
            })
            it("rejects invalid address", async () => {
                await expect(token.transfer("0x0000000000000000000000000000000000000000", _amount)).to.be.reverted
            })
        })

    })

})
