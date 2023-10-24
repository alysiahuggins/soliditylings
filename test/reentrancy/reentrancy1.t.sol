// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.19;

import "forge-std/Test.sol";
import "forge-std/console.sol";
import "../../exercises/reentrancy/reentrancy1.sol";

contract Reentrancy1Test is Test {
    Reentrancy1 public reentrancy1;

    function setUp() public {
        reentrancy1 = new Reentrancy1();
        
        //create account, innocent user, and send 6 ether to it
        uint256 _deposit_attack_amount = 5 ether;
        address _innocent_user = address(1234);
        payable(_innocent_user).transfer(_deposit_attack_amount);

        //let the person sending the message (msg.sender) be the innocent_user
        vm.startPrank(_innocent_user);
        reentrancy1.deposit{value: _deposit_attack_amount}();
        vm.stopPrank();
    }

    receive() external payable{
        if(address(reentrancy1).balance>1 ether){
            reentrancy1.withdraw();
        }
    }

    function testAttackFails() public {
        // vm.expectRevert(bytes("Failed to send Ether"));
        uint256 _attack_amount = 1 ether;

        //reentrancy's contract balance before the attacker attacks
        uint256 _reentrancy1_balance_before = address(reentrancy1).balance;

        //deposit attack amount in the contract to prepare for the reentrancy attack
        reentrancy1.deposit{value: _attack_amount}();
        uint256 _attacker_balance_before = address(this).balance;
        
        vm.expectRevert(bytes("Failed to send Ether"));
        //attacker withdraws its balance which starts the reentrancy attack which causes receive to be triggered & thus reenter the victim
        reentrancy1.withdraw();

        uint256 _attacker_balance_after = address(this).balance;
        
        //assert that the attacker balance before and after is the same because the attack did not work and the txn failed
        assertEq(_attacker_balance_before, _attacker_balance_after);

    }

}
