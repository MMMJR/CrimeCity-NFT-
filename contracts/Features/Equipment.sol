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
import "./../utils/CharacterUtils.sol";

import "./../tokens/Character.sol";
import "./../tokens/GANG.sol";
import "./../tokens/GameItem.sol";
import "./../CoreInGame.sol";

contract Equipment is Admin, IERC721Receiver {
    address private _contractowner;
    address private _secondowner;

    uint256 private bnbBalance;

    Utils private utils;
    Character private crimeChar;
    CharacterUtils private charUtils;
    GameItem private crimeItem;
    CoreInGame private game;

    constructor(Utils _util, Character _character, GameItem _gameItem, CharacterUtils _charUtils, CoreInGame _game) Admin()
    {
        _contractowner = msg.sender;
        _secondowner = address(YOUR SECOND OWNER WALLET);
        bnbBalance = 0;
        crimeChar = _character;
        crimeItem = _gameItem;
        utils = _util;
        game = _game;
        charUtils = _charUtils;

        _setRoleAdmin(DEFAULT_ADMIN_ROLE, DEFAULT_ADMIN_ROLE);
        _setRoleAdmin(DEFAULT_CORE_ROLE, DEFAULT_ADMIN_ROLE);
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(DEFAULT_ADMIN_ROLE, _secondowner);
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

    function changeAdmin(address newAdmin) public onlyRole(DEFAULT_ADMIN_ROLE)
    {
        _contractowner = newAdmin;
    }

    function equipWeapon(uint256 tokenId, uint256 gameItemTokenId) public{
        require(game.checkCharacterCanRunHP(msg.sender, tokenId), "Not Run in this Season");
        require(crimeItem.ownerOf(gameItemTokenId) == msg.sender, "No owner");
        _GameItem memory item = crimeItem.getGameItem(gameItemTokenId);
        CharacterDetail memory char = crimeChar.getCharacter(tokenId);
        require(char.weaponId == 0 && !item.equiped, "No EQUIP");
        char.weaponId = gameItemTokenId;
        item.equiped = true;
        item.equipedTime = (block.timestamp + (3 days));
        crimeChar.UpdateCharacter(tokenId, char);
        crimeItem.UpdateGameItem(gameItemTokenId, item);
        charUtils.UpdateCharacterItemBonus(tokenId, 0);
    }

    function unequipWeapon(uint256 tokenId) public {
        require(game.checkCharacterCanRunHP(msg.sender, tokenId), "Not Run in this Season");
        CharacterDetail memory char = crimeChar.getCharacter(tokenId);
        _GameItem memory item = crimeItem.getGameItem(char.weaponId);
        require(char.weaponId > 0 && item.equiped, "No EQUIP");
        require(block.timestamp >= item.equipedTime, "Equipment in Cooldown");
        uint256 gameItemTokenId = char.weaponId;
        require(crimeItem.ownerOf(gameItemTokenId) == msg.sender, "No owner");
        char.weaponId = 0;
        item.equiped = false;
        crimeChar.UpdateCharacter(tokenId, char);
        crimeItem.UpdateGameItem(gameItemTokenId, item);
        charUtils.UpdateCharacterItemBonus(tokenId, gameItemTokenId);
    }
}