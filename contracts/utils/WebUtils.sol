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

import "./../tokens/Character.sol";
import "./../tokens/GANG.sol";
import "./../tokens/GameItem.sol";
import "./../CoreInGame.sol";


contract WebUtils is Admin, IERC721Receiver {

    struct CharacterDetailWeb
    {
        string name;
        uint256 class; // (1 = ladrao, 2 = gangster, 3 = empresario, 4 = traficante)
        uint256 rarity;
        uint256 respect;
        uint256 vicio;
        uint256 power;
        uint256 level;
        uint256 exp;
        uint256 maxHp;
        uint256 curHp;
        uint256 _str;
        uint256 _int;
        uint256 _cha;
        uint256 _res;

        uint256 lastExpedition;
        uint256 lastExpeditionResult;
        uint256 lastExpeditionRoll;
        uint256 prisonTime;
        uint256 nurseTime;
        uint256 coleteTime;
        uint256 lastPvP;
        uint256 lastPvPResult;
        uint256 lastPvPRoll;
        uint256 pvpDefeatCount;
        uint256 pvpDefeatTime;

        uint256 guildId;
        uint256 weaponId;
        uint256 seasonId;
        uint256 prisonPrice;
        uint256 hospitalPrice;
        address owner;
        uint256 tokenId;
    }

    struct _GameItemWeb
    {
        string name;
        uint256 rarity;
        uint256 img;
        uint256 powerBonus; //stamina, fixo, usa  
        uint256 strBonus;
        uint256 intBonus;
        uint256 chaBonus;
        uint256 resBonus;
        address owner;
        uint256 itemId;
        uint256 tokenId;
        bool equiped;
        uint256 equipedTime;
    }
    address private _contractowner;
    address private _secondowner;

    uint256 private bnbBalance;

    Utils private utils;
    Character private crimeChar;
    GameItem private crimeItem;
    bool private Initialized;

    constructor(Utils _util, Character _character, GameItem _gameItem) Admin()
    {
        _contractowner = msg.sender;
        _secondowner = address(YOUR SECOND OWNER WALLET);
        bnbBalance = 0;
        crimeChar = _character;
        utils = _util;
        crimeItem = _gameItem;

        _setRoleAdmin(DEFAULT_ADMIN_ROLE, DEFAULT_ADMIN_ROLE);
        _setRoleAdmin(DEFAULT_CORE_ROLE, DEFAULT_ADMIN_ROLE);
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(DEFAULT_ADMIN_ROLE, _secondowner);
        Initialized = false;
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

    function bridgeCharacterStructToWebStruct(CharacterDetail memory char) public pure returns(CharacterDetailWeb memory)
    {
        CharacterDetailWeb memory charWeb = CharacterDetailWeb(char.name, char.class, char.rarity, char.respect, char.vicio, char.power, char.level, char.exp,
        char.maxHp, char.curHp, char._str, char._int, char._cha, char._res, char.lastExpedition, char.lastExpeditionResult, char.lastExpeditionRoll, char.prisonTime,
        char.nurseTime, char.coleteTime, char.lastPvP, char.lastPvPResult, char.lastPvPRoll, char.pvpDefeatCount, char.pvpDefeatTime, char.guildId, char.weaponId,
        char.seasonId, char.prisonPrice, char.hospitalPrice, char.owner, char.tokenId );

        return charWeb;
    }

    function bridgeGameItemStructToWebStruct(_GameItem memory item) public pure returns(_GameItemWeb memory)
    {
        _GameItemWeb memory charWeb = _GameItemWeb(item.name, item.rarity, item.img, item.powerBonus,
        item.strBonus, item.intBonus, item.chaBonus, item.resBonus, item.owner, item.itemId, item.tokenId, item.equiped, item.equipedTime);

        return charWeb;
    }

    function getAllCharactersBySeasonId(address user, uint256 seasonId) public view returns (uint256[] memory)
    {
        uint256 tokenCount  = crimeChar.getTotalSupply();
        uint256 resultIndex = 0;
        if(tokenCount == 0)
        {
            return new uint256[](0);
        }
        else
        {
            for(uint256 x = 1; x < tokenCount; x++)
            {
                if(!crimeChar.exists(x)) continue;
                if(crimeChar.ownerOf(x) == user)
                {
                    CharacterDetail memory _char = crimeChar.getCharacter(x);
                    if(_char.seasonId == seasonId)
                    {
                        resultIndex++;
                    }
                }
            }
            if(resultIndex > 0)
            {
                uint256[] memory result = new uint256[](resultIndex);
                uint256 totalNfts = crimeChar.getTotalSupply();
                uint256 i;
                uint256 index = 0;
                for(i = 1; i < totalNfts; i++)
                {
                    if(!crimeChar.exists(i)) continue;
                    if(crimeChar.ownerOf(i) == user)
                    {
                        CharacterDetail memory _char = crimeChar.getCharacter(i);
                        if(_char.seasonId == seasonId)
                        {
                            result[index] = i;
                            index++;
                        }
                    }
                }
                return result;
            }
            else
            {
                return new uint256[](0);
            }
        }
    }
        
    function getAllCharactersByRarity(address user, uint256 rarity) public view returns (uint256[] memory)
    {
        uint256 tokenCount  = crimeChar.getTotalSupply();
        uint256 resultIndex = 0;
        if(tokenCount == 0)
        {
            return new uint256[](0);
        }
        else
        {
            for(uint256 x = 1; x < tokenCount; x++)
            {
                if(!crimeChar.exists(x)) continue; //** */
                if(crimeChar.ownerOf(x) == user)
                {
                    CharacterDetail memory _char = crimeChar.getCharacter(x);
                    if(_char.rarity == rarity)
                    {
                        resultIndex++;
                    }
                }
            }
            if(resultIndex > 0)
            {
                uint256[] memory result = new uint256[](resultIndex);
                uint256 totalNfts = crimeChar.getTotalSupply();
                uint256 i;
                uint256 index = 0;
                for(i = 1; i < totalNfts; i++)
                {
                    if(!crimeChar.exists(i)) continue;
                    if(crimeChar.ownerOf(i) == user)
                    {
                        CharacterDetail memory _char = crimeChar.getCharacter(i);
                        if(_char.rarity == rarity)
                        {
                            result[index] = i;
                            index++;
                        }
                    }
                }
                return result;
            }
            else
            {
                return new uint256[](0);
            }
        }
    }

    function getAllCharactersForUser(address user) public view returns (uint256[] memory)
    {
        uint256 tokenCount  = crimeChar.balanceOf(user);
        if(tokenCount == 0)
        {
            return new uint256[](0);
        }
        else
        {
            uint256[] memory result = new uint256[](tokenCount);
            uint256 totalNfts = crimeChar.getTotalSupply();
            uint256 i;
            uint256 resultIndex = 0;
            for(i = 1; i < totalNfts; i++)
            {
                if(!crimeChar.exists(i)) continue;
                if(crimeChar.ownerOf(i) == user)
                {
                    result[resultIndex] = i;
                    resultIndex++;
                }
            }
            return result;
        }
    }

    function getAllCharactersByTokenIds(int256 max, int256 min, int256[] memory tokenIds, address addr) public view returns (CharacterDetailWeb[] memory)
    {
        uint256 tokenCount  = tokenIds.length;

        if(tokenCount == 0)
        {
            return new CharacterDetailWeb[](0);
        }
        else
        {
            CharacterDetailWeb[] memory result = new CharacterDetailWeb[](tokenCount);
            int256 i;
            uint256 resultIndex = 0;
            for(i = max; i >= min; i--)
            {
                if(i >= 0)
                {
                    if(!crimeChar.exists(uint256(tokenIds[uint256(i)]))) continue;
                    if(crimeChar.ownerOf(uint256(tokenIds[uint256(i)])) == addr)
                    {
                        CharacterDetail memory _char = crimeChar.getCharacter(uint256(tokenIds[uint256(i)]));
                        CharacterDetailWeb memory charWeb = bridgeCharacterStructToWebStruct(_char);
                        result[resultIndex] = charWeb;
                        resultIndex++;
                    }
                }
            }
            return result;
        }
    }

    function getAllItemsForUser(address user) public view returns (uint256[] memory)
    {
        uint256 tokenCount  = crimeItem.balanceOf(user);
        if(tokenCount == 0)
        {
            return new uint256[](0);
        }
        else
        {
            uint256[] memory result = new uint256[](tokenCount);
            uint256 totalNfts = crimeItem.getTotalSupply();
            uint256 i;
            uint256 resultIndex = 0;
            for(i = 1; i < totalNfts; i++)
            {
                if(!crimeItem.exists(i)) continue;
                if(crimeItem.ownerOf(i) == user)
                {
                    result[resultIndex] = i;
                    resultIndex++;
                }
            }
            return result;
        }
    }


    function getAllItemsByItemId(address user, uint256 itemId) public view returns (uint256[] memory)
    {
        uint256 tokenCount  = crimeItem.getTotalSupply();
        uint256 resultIndex = 0;
        if(tokenCount == 0)
        {
            return new uint256[](0);
        }
        else
        {
            for(uint256 x = 1; x < tokenCount; x++)
            {
                if(!crimeItem.exists(x)) continue;
                if(crimeItem.ownerOf(x) == user)
                {
                    _GameItem memory item = crimeItem.getGameItem(x);
                    if(item.itemId == itemId)
                    {
                        resultIndex++;
                    }
                }
            }
            if(resultIndex > 0)
            {
                uint256[] memory result = new uint256[](resultIndex);
                uint256 totalNfts = crimeItem.getTotalSupply();
                uint256 i;
                uint256 index = 0;
                for(i = 1; i < totalNfts; i++)
                {
                    if(!crimeItem.exists(i)) continue;
                    if(crimeItem.ownerOf(i) == user)
                    {
                        _GameItem memory item = crimeItem.getGameItem(i);
                        if(item.itemId == itemId)
                        {
                            result[index] = i;
                            index++;
                        }
                    }
                }
                return result;
            }
            else
            {
                return new uint256[](0);
            }
        }
    }

    function getAllItemsByTokenIds(int256 max, int256 min, int256[] memory tokenIds) public view returns (_GameItemWeb[] memory)
    {
        uint256 tokenCount = tokenIds.length;

        if(tokenCount == 0)
        {
            return new _GameItemWeb[](0);
        }
        else
        {
            _GameItemWeb[] memory result = new _GameItemWeb[](tokenCount);
            int256 i;
            uint256 resultIndex = 0;
            for(i = max; i >= min; i--)
            {
                if(i >= 0)
                {
                    if(!crimeItem.exists(uint256(tokenIds[uint256(i)]))) continue;
                    _GameItem memory _item = crimeItem.getGameItem(uint256(tokenIds[uint256(i)]));
                    _GameItemWeb memory itemWeb = bridgeGameItemStructToWebStruct(_item);
                    result[resultIndex] = itemWeb;
                    resultIndex++;
                }
            }
            return result;
        }
    }

    function getAllItemsByTokenIds(int256[] memory tokenIds) public view returns (_GameItemWeb[] memory)
    {
        uint256 tokenCount = tokenIds.length;

        if(tokenCount == 0)
        {
            return new _GameItemWeb[](0);
        }
        else
        {
            _GameItemWeb[] memory result = new _GameItemWeb[](tokenCount);
            int256 i;
            uint256 resultIndex = 0;
            for(i = 0; i < int256(tokenIds.length); i++)
            {
                if(i >= 0)
                {
                    if(!crimeItem.exists(uint256(tokenIds[uint256(i)]))) continue;
                    _GameItem memory _item = crimeItem.getGameItem(uint256(tokenIds[uint256(i)]));
                    _GameItemWeb memory itemWeb = bridgeGameItemStructToWebStruct(_item);
                    result[resultIndex] = itemWeb;
                    resultIndex++;
                }
            }
            return result;
        }
    }

    function getAllCharacterByTokenIds(int256[] memory tokenIds) public view returns (CharacterDetailWeb[] memory)
    {
        uint256 tokenCount = tokenIds.length;

        if(tokenCount == 0)
        {
            return new CharacterDetailWeb[](0);
        }
        else
        {
            CharacterDetailWeb[] memory result = new CharacterDetailWeb[](tokenCount);
            int256 i;
            uint256 resultIndex = 0;
            for(i = 0; i < int256(tokenIds.length); i++)
            {
                if(i >= 0)
                {
                    if(!crimeChar.exists(uint256(tokenIds[uint256(i)]))) continue;
                    CharacterDetail memory _item = crimeChar.getCharacter(uint256(tokenIds[uint256(i)]));
                    CharacterDetailWeb memory itemWeb = bridgeCharacterStructToWebStruct(_item);
                    result[resultIndex] = itemWeb;
                    resultIndex++;
                }
            }
            return result;
        }
    }
    
}