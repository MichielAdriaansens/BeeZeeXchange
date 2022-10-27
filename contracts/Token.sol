//SPDX-License-Identifier: Pen Is
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract Token{
    string public name;
    string public symbol;
    uint256 public decimals = 18;
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event Approval(address indexed _owner, address indexed _spender, uint256 _value);

    constructor(string memory _name, string memory _sym,uint256 _amount){
        name = _name;
        symbol = _sym;
        totalSupply = _amount * (10 ** decimals);
      //  transfer(msg.sender, totalSupply);
        balanceOf[msg.sender] = totalSupply;
    }

    function transfer(address _to, uint256 _value) public returns(bool success){
        require(balanceOf[msg.sender] >= _value, "not enough funds to go around, cowboy!");
        require(_to != address(0), "incorrect address");

        _transfer(msg.sender, _to, _value);
        return success = true;
    }

    function _transfer(address _from, address _to, uint256 _value) internal {
        emit Transfer(_from, _to, _value);
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
    }

    //transfer_from function
    function transferFrom(address _from, address _to, uint256 _value) public returns(bool success){
        require(_value <= balanceOf[_from], "insufficient funds");
        require(_value <= allowance[_from][msg.sender], "isufficient allowance");
        require(_to != address(0));
        
        //allowance wordt lager
        allowance[_from][msg.sender] -= _value;
        _transfer(_from, _to,_value);
        
        return true;
    }
    //approval for transferFrom function 
    function approve(address _spender, uint256 _value) public returns(bool success){
        require(_spender != address(0), "address does not exist");
        require(_value <= balanceOf[msg.sender], "not enough tokens");
        emit Approval(msg.sender, _spender, _value);
        
        allowance[msg.sender][_spender] = _value;
        return true;
    }
}
