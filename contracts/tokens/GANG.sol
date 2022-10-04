// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.4.22 <0.9.0;

import "../../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../../node_modules/@openzeppelin/contracts/access/Ownable.sol";

contract GANG is ERC20, Ownable {
    /**
     * @dev Constructor that gives msg.sender all of existing tokens.
     */
    constructor() ERC20("GANG", "GANG") {
        _approve(address(this), msg.sender, totalSupply());
        mint(6000000);
    }

    function mint(uint256 amount) public onlyOwner {
        _mint(msg.sender, amount * (10 ** uint256(decimals())));
    }

}