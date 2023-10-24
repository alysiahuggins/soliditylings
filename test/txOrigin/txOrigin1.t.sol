// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.19;

import "forge-std/Test.sol";
import "forge-std/console.sol";
import "../../exercises/txOrigin/txOrigin1.sol";

contract Reentrancy1Test is Test {
    TxOrigin1 public txOrigin1;

    function setUp() public {
        txOrigin1 = new TxOrigin1();
        
        //create account, innocent user, and send 6 ether to it
        uint256 _deposit_amount = 5 ether;
        address _innocent_user = address(1234);

        //let the person sending the message (msg.sender) be the innocent_user
        vm.startPrank(_innocent_user);
        //fund the innocent user
        vm.deal(_innocent_user, _deposit_amount);
        txOrigin1.deposit{value: _deposit_amount}();
        vm.stopPrank();
    }

    function attack() public{
        uint balance = txOrigin1.getBalance(msg.sender);
        require(balance>0, "this user does not have enough balance");
        txOrigin1.withdrawTo(address(this), balance);
    }

    receive() external payable{
    }

    function testAttackFails() public {
        uint _vul_contract_bal_before = address(txOrigin1).balance;

        //a phishing attack has occurred and we're getting the innocent user to call the attack method of our smart contract
        address _innocent_user = address(1234);
        vm.startBroadcast(_innocent_user);
        vm.expectRevert(bytes("Insufficient balance"));
        this.attack();
        vm.stopBroadcast();

        uint _vul_contract_bal_after = address(txOrigin1).balance;

        assertEq(_vul_contract_bal_after, _vul_contract_bal_before);
        

    }

}
