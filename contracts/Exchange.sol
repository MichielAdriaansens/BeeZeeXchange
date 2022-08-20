//SPDX-License-Identifier: pen IS
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract Exchange{
    address public feeAccount;
    uint256 public feePercent;

    constructor(address _fAccount,uint256 _fPercent){
        feeAccount = _fAccount;
        feePercent = _fPercent;
    }
    
    mapping(address => uint) public checkBalance;

    //deposit Tokens
    //withdraw Tokens

    //make orders
    //fill orders
    //cancel orders

    //charge fees
    //track fees account
}
