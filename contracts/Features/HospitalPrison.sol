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

contract HospitalPrison is Admin, IERC721Receiver {
    address private _contractowner;
    address private _secondowner;

    uint256 private bnbBalance;

    Utils private utils;
    Character private crimeChar;
    GameItem private crimeItem;
    CoreInGame private game;

    constructor(Utils _util, Character _character, GameItem _gameItem, CoreInGame _game) Admin()
    {
        _contractowner = msg.sender;
        _secondowner = address(YOUR SECOND OWNER WALLET);
        bnbBalance = 0;
        crimeChar = _character;
        crimeItem = _gameItem;
        utils = _util;
        game = _game;

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
    
    function changeAdmin(address newAdmin) public onlyRole(DEFAULT_ADMIN_ROLE)
    {
        _contractowner = newAdmin;
    }

    function bnbWithdraw() onlyRole(DEFAULT_ADMIN_ROLE) public
    {
        address payable owner = payable(msg.sender);
        require(bnbBalance > 0, "Insufficient Balance");
        owner.transfer(bnbBalance);
    }

    function getNurseCountDown(uint256 tokenId) public view returns (uint256)
    {
        require(crimeChar.exists(tokenId), "No Exists");
        CharacterDetail memory char = crimeChar.getCharacter(tokenId);

        require(char.seasonId == game.getSeasonId(), "Error Season Id");
        uint256 result = 0;
        if(char.nurseTime > block.timestamp)
        {
            uint256 diff= char.nurseTime - block.timestamp;
            diff = diff / (1 days);
            result = diff;
        }
        return result;
    }

    function getPrisonCountDown(uint256 tokenId) public view returns (uint256)
    {
        require(crimeChar.exists(tokenId), "No Exists");
        CharacterDetail memory char = crimeChar.getCharacter(tokenId);

        require(char.seasonId == game.getSeasonId(), "Error Season Id");
        uint256 result = 0;
        if(char.prisonTime > block.timestamp)
        {
            uint256 diff= char.prisonTime - block.timestamp;
            diff = diff / (1 days);
            result = diff;
        }
        return result;
    }

    function treatAddict(uint256 tokenId) public{
        require(game.checkCharacterCanRunHP(msg.sender, tokenId), "Not Run in this Season");
        CharacterDetail memory char = crimeChar.getCharacter(tokenId);
        require(char.vicio > 0, "Character Not in Hostpital");
        uint256 totalPrice = utils.getMintPrice() / 40;
        InGame memory acc = game.getIngameAccount(msg.sender);
        require(acc.balance >= totalPrice, "Insufficient Balance");
        acc.balance -= totalPrice;
        game.UpdateInGameAccount(msg.sender, acc);
        char.vicio = 0;
        crimeChar.UpdateCharacter(tokenId, char);
    }
    
    function reviveHospital(uint256 tokenId) public{
        require(game.checkCharacterCanRunHP(msg.sender, tokenId), "Not Run in this Season");
        CharacterDetail memory char = crimeChar.getCharacter(tokenId);
        require(char.nurseTime > 0, "Character Not in Hostpital");
        uint256 totalPrice = char.hospitalPrice;
        InGame memory acc = game.getIngameAccount(msg.sender);
        if(block.timestamp < char.nurseTime)
        {
             require(acc.balance >= totalPrice, "Insufficient Balance");
             acc.balance -= totalPrice;
             game.UpdateInGameAccount(msg.sender, acc);
        }
        char.curHp = char.maxHp;
        char.hospitalPrice = 0;
        char.nurseTime = 0;
        crimeChar.UpdateCharacter(tokenId, char);
    }

    function withdrawPrison(uint256 tokenId) public{
        require(game.checkCharacterCanRunHP(msg.sender, tokenId), "Not Run in this Season");
        CharacterDetail memory char = crimeChar.getCharacter(tokenId);
        require(char.prisonTime > 0, "Character Not in Prison");
        uint256 totalPrice = char.prisonPrice;
        InGame memory acc = game.getIngameAccount(msg.sender);
        if(block.timestamp < char.prisonTime)
        {
             require(acc.balance >= totalPrice, "Insufficient Balance");
             acc.balance -= totalPrice;
             game.UpdateInGameAccount(msg.sender, acc);
        }
        char.prisonPrice = 0;
        char.prisonTime = 0;
        crimeChar.UpdateCharacter(tokenId, char);
    }

    function getColetePrice(uint256 tokenId) public view returns (uint256)
    {
        CharacterDetail memory char = crimeChar.getCharacter(tokenId);
         return ((utils.getMintPrice() / 40) * char.level);
    }

    function useItem(uint256 charId, uint256 itemId, uint256 quantity) public
    {
        require(game.checkCharacterCanRunHP(msg.sender, charId), "Not Run in this Season");
        require(crimeChar.ownerOf(charId) == msg.sender, "No Owner");
        CharacterDetail memory char = crimeChar.getCharacter(charId);
        uint256 hp = 0;
        uint256 vicio = 0;
        require(itemId >= 10 && itemId < 14, "Only drugs use");
        InGame memory acc = game.getIngameAccount(msg.sender);
        if(itemId == 10)
        {
            require(acc.beer >= quantity, "Insufficient Amount");
            hp = 50;
            vicio = 10;
            acc.beer -= quantity;
        }
        else if(itemId == 11)
        {
            require(acc.cannabis >= quantity, "Insufficient Amount");
            hp = 100;
            vicio = 10;
            acc.cannabis -= quantity;
        }
        else if(itemId == 12)
        {
            require(acc.opio >= quantity, "Insufficient Amount");
            hp = 200;
            vicio = 15;
            acc.opio -= quantity;
        }
        else
        {
            require(acc.cocaine >= quantity, "Insufficient Amount");
            hp = 500;
            vicio = 20;
            acc.cocaine -= quantity;
        }

        for(uint256 x = 0; x < quantity; x++)
        {
            if((char.curHp + hp) > char.maxHp)
            {
                char.curHp = char.maxHp;
            }
            else char.curHp += hp;

            if((char.vicio + vicio) > 100)
            {
                char.vicio = 100;
            }
            else char.vicio += vicio;
        }
        game.UpdateInGameAccount(msg.sender, acc);
        crimeChar.UpdateCharacter(charId, char);
    }

    function activeBulletProof(uint256 tokenId) public {
        require(game.checkCharacterCanRunHP(msg.sender, tokenId), "Not Run in this Season");
        CharacterDetail memory char = crimeChar.getCharacter(tokenId);
        uint256 cost = ((utils.getMintPrice() / 40) * char.level);
        InGame memory acc = game.getIngameAccount(msg.sender);
        require(acc.balance >= cost, "Inssuficient Ammount");
        uint256 btime = utils.getBlockChainTime();
        if(char.coleteTime > btime)
        {
            char.coleteTime += (5 days);
        }
        else
        {
            char.coleteTime = utils.getBlockChainTime() + (5 days);
        }
        acc.balance -= cost;
        game.UpdateInGameAccount(msg.sender, acc);
        crimeChar.UpdateCharacter(tokenId, char);
    }
}