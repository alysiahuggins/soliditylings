//SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.19;
//I AM NOT DONE
contract Reentrancy1{ 
    mapping (address=>uint256) public balances;
    
    function deposit() public payable{
        require(msg.value>0, "Please deposit some ETH");
        balances[msg.sender] += msg.value;
    }

    function withdraw() public{
        uint256 bal = balances[msg.sender];
        require(bal>0, "the user did not deposit that amount in this contract");

        (bool sent, ) = msg.sender.call{value: bal}("");

        balances[msg.sender] = 0;

        require(sent, "Failed to send Ether");

    }
}