//SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.19;

//I AM NOT DONE
contract TxOrigin1{
    mapping(address => uint256) public balances;

    function deposit() public payable {
        balances[msg.sender] += msg.value;
    }

    function getBalance(address sender) public view returns(uint256){
        return balances[sender];
    }

    function withdrawTo(address recipient, uint256 amount) public {
        require(balances[tx.origin] >= amount, "Insufficient balance");
        balances[tx.origin] -= amount;
        (bool sent, ) = recipient.call{value: amount}("");
        require(sent, "Failed to send Ether");
    }
}