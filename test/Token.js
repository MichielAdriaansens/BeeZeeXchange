const { assert } = require("chai")
//const { expect } = require("chai")
const { ethers } = require("hardhat")

const tokens = (_amount) => {
   return ethers.utils.parseUnits(`${_amount}`, "ether").toString()
}

describe("Token", ()=>{
    let token;

    beforeEach(async ()=>{
        //fetch the Token Contract
        const Token = await ethers.getContractFactory("Token") //dit is een referentie naar het Contract.
        token = await Token.deploy("NiggaToken","NT",1000000) //om goed te testen moet je het contract eerst deployen. 
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
    })

})