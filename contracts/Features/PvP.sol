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

contract PvP is Admin, IERC721Receiver {
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

    function changeAdmin(address newAdmin) public onlyRole(DEFAULT_ADMIN_ROLE)
    {
        _contractowner = newAdmin;
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

    function beginPvP(uint256 tokenId, uint256 defenseId) public returns (uint256) {
        require(crimeChar.ownerOf(tokenId) == msg.sender, "Error 1");
        require(game.checkCharacterCanRun(msg.sender, tokenId), "Not Run in this Season");

        CharacterDetail memory char = crimeChar.getCharacter(tokenId);
        CharacterDetail memory defensor = crimeChar.getCharacter(defenseId);

        require(char.nurseTime == 0, "Character in Hospital"); //**** *//*
        require(char.prisonTime == 0, "Character in Prison");

        require((block.timestamp >= char.lastPvP) || (char.lastPvP == 0), "One per Day"); //LastPvP

        require((defensor.pvpDefeatTime == 0 || block.timestamp >= defensor.pvpDefeatTime), "Tomorrow you can do this"); //no in CD, 

        char.lastPvP = block.timestamp + (1 days);

        defensor.pvpDefeatCount++;
        if(defensor.pvpDefeatCount == 3 && defensor.pvpDefeatTime == 0)
        {
            defensor.pvpDefeatTime = block.timestamp + (1 days);
        }
        else if(defensor.pvpDefeatCount == 3 && block.timestamp >= defensor.pvpDefeatTime)
        {
            defensor.pvpDefeatTime = 0;
            defensor.pvpDefeatCount = 1;
        }
        InGame memory acc = game.getIngameAccount(msg.sender);
        
        if(acc.claimTime == 0)
        {
            acc.claimTime = block.timestamp;
        }

        uint256 returnValue = calculatePvP(char, defensor, acc.vip);

        if(returnValue == 100) 
        {
            if(char.rarity == 1) acc.balance += utils.getMintPrice() / 40;
            else if(char.rarity == 2) acc.balance += utils.getMintPrice() / 30;
            else if(char.rarity == 3) acc.balance += utils.getMintPrice() / 20;
            else acc.balance += utils.getMintPrice() / 13;
        }

        game.UpdateInGameAccount(msg.sender, acc);

        charUtils.UpdatePvPResult(char, defensor, returnValue);
    
        return returnValue;
    }

    function getPvPCountDown(uint256 tokenId) public view returns (uint256)
    {
        require(crimeChar.exists(tokenId), "No Exists");
        CharacterDetail memory char = crimeChar.getCharacter(tokenId);

        require(char.seasonId == game.getSeasonId(), "Error Season Id");
        uint256 result = 0;
        if(char.lastPvP > block.timestamp)
        {
            uint256 diff= char.lastPvP - block.timestamp;
            diff = diff / (1 days);
            result = diff;
        }
        return result;
    }

    function calculatePvP(CharacterDetail memory char, CharacterDetail memory defensor, uint256 vip) public returns (uint256) {
        uint256 returnValue = 0;
        uint256[] memory _stats = new uint256[](4);
        _stats[0] = char._str;
        _stats[1] = char._int;
        _stats[2] = char._cha;
        _stats[3] = char._res;

        uint256[] memory _defensorStats = new uint256[](4);
        _defensorStats[0] = defensor._str;
        _defensorStats[1] = defensor._int;
        _defensorStats[2] = defensor._cha;
        _defensorStats[3] = defensor._res;

        uint256 astats = char.class - 1;
        uint256 dstats = defensor.class - 1;
        uint256 aPower = (_stats[astats] + char.level + utils.rand(20)); //statprincipal + level + rand
        aPower += vip * 4;
        uint256 bPower = (_defensorStats[dstats] + defensor.level + utils.rand(15));
        uint256 diff = 0;

        if(aPower > bPower)
        {
            diff = aPower - bPower;
            if(diff > 25) diff = 25;
            uint256 chance = utils.rand(100);
            if(chance <=  (55 + diff))
            {
                returnValue = 100;
            }
        }
        else
        {
            diff = bPower - aPower;
            if(diff > 25) diff = 25;
            uint256 chance = utils.rand(100);
            if(chance > (40 + diff))
            {
                returnValue = 100;
            }
        }

        return returnValue;
    }
}