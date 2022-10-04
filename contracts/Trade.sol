// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.4.22 <0.9.0;

/**
 * @title SampleBEP20Token
 * @dev Very simple BEP20 Token example, where all tokens are pre-assigned to the creator.
 * Note they can later distribute these tokens as they wish using `transfer` and other
 * `BEP20` functions.
 * USE IT ONLY FOR LEARNING PURPOSES. SHOULD BE MODIFIED FOR PRODUCTION
 */

import "../node_modules/@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "./utils/Admin.sol";
import "./utils/Utils.sol";
import "./tokens/GANG.sol";


contract Trade is Admin, IERC721Receiver {
    address _contractowner;
    address private _secondowner;

    struct CoreOwner
    {
        address owner;
    }

    uint256 bnbBalance;

    GANG private gangToken;
    Utils private utils;
    constructor(GANG _gang, Utils _utils) Admin()
    {
        _contractowner = msg.sender;
        _secondowner = address(YOUR SECOND OWNER WALLET);
        bnbBalance = 0;
        gangToken = _gang;
        utils = _utils;
        _setRoleAdmin(DEFAULT_ADMIN_ROLE, DEFAULT_ADMIN_ROLE);
        _setRoleAdmin(DEFAULT_CORE_ROLE, DEFAULT_ADMIN_ROLE);
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(DEFAULT_ADMIN_ROLE, _secondowner);
    }

    function changeAdmin(address newAdmin) public onlyRole(DEFAULT_ADMIN_ROLE)
    {
        _contractowner = newAdmin;
    }

    function onERC721Received(address, address, uint256, bytes memory) public virtual override returns (bytes4) {
        return this.onERC721Received.selector;
    }

    function supportsInterface(bytes4 interfaceId) public pure returns (bool) {
        return interfaceId == type(IERC721Receiver).interfaceId;
    }

    function bnbWithdraw() onlyRole(DEFAULT_ADMIN_ROLE) public
    {
        address payable owner = payable(msg.sender);
        require(bnbBalance > 0, "Insufficient Balance");
        owner.transfer(bnbBalance);
    }

    function tradeGang() public payable {
        require(msg.value >= 200000000000000000, "Insufficient Ammount");
        uint256 gangReceive = msg.value * 50;
        require(gangToken.allowance(_contractowner, address(this)) >= gangReceive, "Require approve admin");
        require(gangToken.balanceOf(_contractowner) >= gangReceive, "Require balance");
        bnbBalance += msg.value;
        gangToken.transferFrom(_contractowner, msg.sender, gangReceive);
    }

    function sellGang(uint256 amount) public payable {
        require(msg.value >= utils.getContractValue(), "Inssuficient Ammount");
        require(amount > 1000000000000000000, "Inssuficient Ammount");
        require(gangToken.allowance(msg.sender, address(this)) >= amount, "Require Approve");
        require(gangToken.balanceOf(msg.sender) >= amount, "Insufficient Balance");
        address payable owner = payable(msg.sender);
        uint256 bnbReceive = ((amount * 2) / 100);

        require(bnbBalance >= bnbReceive, "Not have to pay");

        bnbBalance = bnbBalance - bnbReceive;
        owner.transfer(bnbReceive);
        bnbBalance += msg.value;
        gangToken.transferFrom(msg.sender, _contractowner, amount);
    }
}