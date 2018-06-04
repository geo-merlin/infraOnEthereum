pragma solidity ^0.4.24;

/** @title Ownable
 *  @dev The Ownable contract has an manager address, and provides basic authorization control
 *   functions, this simplifies the implementation of "user permissions". **/
contract Ownable {
    address public manager;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /** @dev The Ownable constructor sets the original `manager` of the contract to the sender account. **/
    constructor() public {
        manager = msg.sender;
    }


    /** @dev Throws if called by any account other than the manager. **/
    modifier onlyOwner() {
        require(msg.sender == manager);
        _;
    }

    /** @dev Allows the current manager to transfer control of the contract to a newOwner.
         @param newOwner The address to transfer ownership to. **/
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0));
        OwnershipTransferred(manager, newOwner);
        manager = newOwner;
    }
}
