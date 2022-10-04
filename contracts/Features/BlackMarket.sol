// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.4.22 <0.9.0;

/**
 * @title SampleBEP20Token
 * @dev Very simple BEP20 Token example, where all tokens are pre-assigned to the creator.
 * Note they can later distribute these tokens as they wish using `transfer` and other
 * `BEP20` functions.
 * USE IT ONLY FOR LEARNING PURPOSES. SHOULD BE MODIFIED FOR PRODUCTION
 */

import "../../node_modules/@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "./../utils/Admin.sol";
import "./../utils/Utils.sol";

import "./../tokens/GANG.sol";
import "./../tokens/GameItem.sol";
import "./../CoreInGame.sol";
import "./../SeasonManager.sol";

contract BlackMarket is Admin, IERC721Receiver {
    address private _contractowner;
    address private _secondowner;

    uint256 private bnbBalance;

    Utils private utils;
    GameItem private crimeItem;
    SeasonManager private season;
    GANG private gangToken;
    CoreInGame private game;

    constructor(Utils _util, GANG gang, GameItem _gameItem, SeasonManager _season, CoreInGame _core) Admin()
    {
        _contractowner = msg.sender;
        _secondowner = address(YOUR SECOND OWNER WALLET);
        bnbBalance = 0;
        crimeItem = _gameItem;
        utils = _util;
        season = _season;
        gangToken = gang;
        game = _core;

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

    function sellDrugs(uint256 quantity, uint256 itemId) public{
        gameSeason memory seasonManager = season.getSeasonManager();
        require(utils.strcmp(seasonManager.seasonState, "RUNNING"), "Season not started");
        require(itemId >= 10 && itemId < 14, "Cannot be Produce this item");
        uint256 totalPrice = 0;
        InGame memory acc = game.getIngameAccount(msg.sender);
        if(itemId == 10)
        {
            require(acc.beer >= quantity, "Inssuficient balance");
            totalPrice += ((((utils.getMintPrice() * 3) / 45) / 6) * quantity);
            acc.beer -= quantity;
        }
        else if(itemId == 11)
        {
            require(acc.cannabis >= quantity, "Inssuficient balance");
            totalPrice += ((((utils.getMintPrice() * 3) / 35) / 6) * quantity);
            acc.cannabis -= quantity;
        }
        else if(itemId == 12) 
        {
            require(acc.opio >= quantity, "Inssuficient balance");
            totalPrice += ((((utils.getMintPrice() * 3) / 25) / 6) * quantity);
            acc.opio -= quantity;
        }
        else 
        {
            require(acc.cocaine >= quantity, "Inssuficient balance");
            totalPrice += ((((utils.getMintPrice() * 3) / 15) / 6) * quantity);
            acc.cocaine -= quantity;
        }

        require(gangToken.allowance(_contractowner, address(this)) >= totalPrice, "Require approve");
        require(gangToken.balanceOf(_contractowner) >= totalPrice, "Insufficient Balance");
        game.UpdateInGameAccount(msg.sender, acc);
        gangToken.transferFrom(_contractowner, msg.sender, totalPrice);
    }

}