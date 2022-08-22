//SPDX-License-Identifier: pen IS
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./Token.sol";

contract Exchange{
    //track fees account
    address public feeAccount;
    uint256 public feePercent;
    uint256 public orderCount;

    constructor(address _fAccount,uint256 _fPercent){
        feeAccount = _fAccount;
        feePercent = _fPercent;
    }

    event Deposit (address token, address user, uint256 amount, uint256 balance);
    event Withdraw(address token, address user, uint256 amount, uint256 balance);
    event Order(
        uint256 id,
        address user, 
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        uint256 timeStamp
    );
    
    //tokenaddress / useraddress => balance
    mapping(address => mapping(address => uint256)) public tokenBalance;
    
    //key is order's id
    mapping(uint256 => _Order) orderList;

    struct _Order {
        uint256 id;
        address user; //user that made the order
        address tokenGet;
        uint256 amountGet;
        address tokenGive;
        uint256 amountGive;
        uint256 timeStamp;
    }


    //--------------------------------------
    //deposit withdraw Tokens
    function depositToken(address _token, uint256 _amount) public{
        require( Token(_token).transferFrom(msg.sender, address(this) , _amount));
        tokenBalance[_token][msg.sender] += _amount;

        emit Deposit(_token, msg.sender , _amount, tokenBalance[_token][msg.sender]);
    }

    function withdrawToken(address _token, uint256 _amount) public {
        require(_amount <= tokenBalance[_token][msg.sender], "withdraw failed, not enough funds!");
        //decrease balance
        tokenBalance[_token][msg.sender] -= _amount;
        //transfer tokens to address
        Token(_token).transfer(msg.sender, _amount);
        //emit event
        emit Withdraw(_token, msg.sender, _amount, tokenBalance[_token][msg.sender]);
    }

    function balanceOf(address _token, address _user) public view returns(uint256){
        return tokenBalance[_token][_user];
    }
    //--------------------------------------
    //make orders
    function makeOrder(address _tokenGet, uint256 _amountGet, address _tokenGive, uint256 _amountGive) public {
        require(balanceOf(_tokenGive , msg.sender) >= _amountGive);
        
        orderCount++;
        orderList[orderCount] = _Order(
            orderCount, 
            msg.sender, 
            _tokenGet, 
            _amountGet, 
            _tokenGive, 
            _amountGive, 
            block.timestamp);

        emit Order(
            orderCount, 
            msg.sender,
            _tokenGet, 
            _amountGet, 
            _tokenGive, 
            _amountGive, 
            block.timestamp
        );

    }
    
    //fill orders
    //cancel orders

    //charge fees
    
}
