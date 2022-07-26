const { assert } = require("chai")
const { ethers } = require("hardhat")

describe("Token", ()=>{
    //Test Yo Ssshit boii.
    it("Contract has name",async ()=>{
        //fetch the Token Contract
        const Token = await ethers.getContractFactory("Token") //dit is een referentie naar het Contract.
        const token = await Token.deploy() //om goed te testen moet je het contract eerst deployen. 

        //reach in and get that contract name
        const name = await token.name()
        
        //code that checks if name of Contract matches
        assert.equal(name,"NiggaToken")
        //
        if(name == "NiggaToken"){
            console.log(name)
        }
    })
})