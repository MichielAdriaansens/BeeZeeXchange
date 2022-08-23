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
    event Cancel(
        uint256 id,
        address user, 
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        uint256 timeStamp
    );
    event Trade(
        uint256 id,
        address user, 
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        address creator,
        uint256 timeStamp
    );
    
    //tokenaddress / useraddress => balance
    mapping(address => mapping(address => uint256)) public tokenBalance;
    
    //key is order's id
    mapping(uint256 => _Order) public orderList;

    mapping(uint256 => bool) public ordersIdCancelled;

    mapping(uint256 => bool) public ordersIdCompleted;

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
        require(balanceOf(_tokenGive , msg.sender) >= _amountGive, "not enough balance to make order");
        
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
    //cancel orders
    function cancelOrder(uint256 _id) public {
        //make a struct variable and retreive order
        _Order storage _order = orderList[_id];

        require(address(_order.user) == msg.sender, "you are not allowed to cancel this order");
        require(_order.id != 0);
        require(_order.id == _id, "Order does not exist!");
        require(ordersIdCancelled[_id] == false, "Order has allready been cancelled");

        ordersIdCancelled[_id] = true;
        emit Cancel(
            _order.id,
            _order.user, 
            _order.tokenGet,
            _order.amountGet,
            _order.tokenGive,
            _order.amountGive,
            _order.timeStamp
        );
    }
    //----------------------------
    //execute orders
    function fillOrder(uint256 _id) public {
        _Order storage _order = orderList[_id];
        //check valid Id
        require(_id > 0  && _id <= orderCount , "order does not exist");
        //check order isn't filled allready
        require(ordersIdCompleted[_id] == false, "order allready filled");
        //check order isn't cancelled
        require(ordersIdCancelled[_id] == false, "order has been cancelled");

        _trade(_order.id, _order.user, _order.tokenGet, _order.amountGet, _order.tokenGive, _order.amountGive);
        
        ordersIdCompleted[_order.id] = true;
    }
    function _trade(
        uint256 _orderId, 
        address _user, 
        address _tokenGet, 
        uint256 _amountGet,
        address _tokenGive,
        uint256 _amountGive
    ) internal{
        //trade..token1
        tokenBalance[_tokenGet][msg.sender] -= _amountGet + feeCharge(_amountGet);
        tokenBalance[_tokenGet][_user] += _amountGet;
        //charge fees
        tokenBalance[_tokenGet][feeAccount] += feeCharge(_amountGet);
        //trade..token2
        tokenBalance[_tokenGive][msg.sender] += _amountGive;
        tokenBalance[_tokenGive][_user] -= _amountGive;
        
        emit Trade(
            _orderId,
            msg.sender, 
            _tokenGet,
            _amountGet,
            _tokenGive,
            _amountGive,
            _user,
            block.timestamp
        );
    }

    function feeCharge(uint256 _amountGet) internal view returns(uint256) {
        return (_amountGet * feePercent) / 100;
    }
    
}
