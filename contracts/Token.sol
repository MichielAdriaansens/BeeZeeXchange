//SPDX-License-Identifier: Pen Is
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract Token{
    string public name;
    string public symbol;
    uint256 public decimals = (10**18);
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;

    constructor(string memory _name, string memory _sym,uint256 _amount){
        name = _name;
        symbol = _sym;
        totalSupply = _amount * decimals;
        transfer(msg.sender, totalSupply);
      //  balanceOf[msg.sender] = totalSupply;
    }

    function transfer(address _to, uint256 _value) public{
        require(totalSupply >= _value, "not enough funds to go around, cowboy!");
        balanceOf[_to] += _value;
    }
}
