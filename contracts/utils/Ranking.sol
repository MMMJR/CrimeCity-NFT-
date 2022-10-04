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


contract Ranking is Admin {

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

    address private _contractowner;
    address private _secondowner;

    uint256 private bnbBalance;

    Utils private utils;
    Character private crimeChar;

    constructor(Utils _util, Character _character) Admin()
    {
        _contractowner = msg.sender;
        _secondowner = address(YOUR SECOND OWNER WALLET);
        bnbBalance = 0;
        crimeChar = _character;
        utils = _util;

        _setRoleAdmin(DEFAULT_ADMIN_ROLE, DEFAULT_ADMIN_ROLE);
        _setRoleAdmin(DEFAULT_CORE_ROLE, DEFAULT_ADMIN_ROLE);
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(DEFAULT_ADMIN_ROLE, _secondowner);
    }

    function bridgeCharacterStructToWebStruct(CharacterDetail memory char) public pure returns(CharacterDetailWeb memory)
    {
        CharacterDetailWeb memory charWeb = CharacterDetailWeb(char.name, char.class, char.rarity, char.respect, char.vicio, char.power, char.level, char.exp,
        char.maxHp, char.curHp, char._str, char._int, char._cha, char._res, char.lastExpedition, char.lastExpeditionResult, char.lastExpeditionRoll, char.prisonTime,
        char.nurseTime, char.coleteTime, char.lastPvP, char.lastPvPResult, char.lastPvPRoll, char.pvpDefeatCount, char.pvpDefeatTime, char.guildId, char.weaponId,
        char.seasonId, char.prisonPrice, char.hospitalPrice, char.owner, char.tokenId );

        return charWeb;
    }

    function changeAdmin(address newAdmin) public onlyRole(DEFAULT_ADMIN_ROLE)
    {
        _contractowner = newAdmin;
    }

    function getAllCharactersInSeason(uint256 seasonId) public view returns (uint256[] memory)
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

                CharacterDetail memory _char = crimeChar.getCharacter(x);
                if(_char.seasonId == seasonId)
                {
                    resultIndex++;
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
                    CharacterDetail memory _char = crimeChar.getCharacter(i);
                    if(_char.seasonId == seasonId)
                    {
                        result[index] = i;
                        index++;
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

    function getSmackDownByCharacter(uint256 tokenId, uint256 seasonId) public view returns (uint256[] memory)
    {
        uint256 tokenCount = crimeChar.getTotalSupply();
        if(tokenCount == 0)
        {
            return new uint256[](0);
        }
        else
        {
            if(!crimeChar.exists(tokenId)) return new uint256[](0);
            CharacterDetail memory _user = crimeChar.getCharacter(tokenId);

            uint256 min = 0;
            if(1000 >= _user.respect) min = 0;
            else min = _user.respect - 1000;
            uint256 max = _user.respect + 1000;

            uint256 resultIndex = 0;
            for(uint256 i = 1; (i < tokenCount && resultIndex <= 10); i++)
            {
                if(!crimeChar.exists(i)) continue;
                if(i == tokenId) continue;
                CharacterDetail memory _char = crimeChar.getCharacter(i);
                if(_char.seasonId == seasonId)
                {
                    if(_char.respect >= min && _char.respect <= max)
                    {
                        resultIndex++;
                    }
                }
            }
            if(resultIndex > 0)
            {
                uint256[] memory result = new uint256[](resultIndex);
                uint256 index = 0;
                for(uint256 i = 1; (i < tokenCount && index < resultIndex); i++)
                {
                    if(!crimeChar.exists(i)) continue;
                    if(i == tokenId) continue;
                    CharacterDetail memory _char = crimeChar.getCharacter(i);
                    if(_char.seasonId == seasonId)
                    {
                        if((_char.respect >= min && _char.respect <= max) && _char.pvpDefeatCount < 3)
                        {
                            result[index] = i;
                            index++;
                        }
                    }
                }
                return result;
            }
            return new uint256[](0);
        }
    }

    function getAllCharactersByTokenIds(int256[] memory tokenIds) public view returns (CharacterDetailWeb[] memory)
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
            for(i = int256(tokenCount-1); i >= 0; i--)
            {
                if(i >= 0)
                {
                    if(!crimeChar.exists(uint256(tokenIds[uint256(i)]))) continue;
                    CharacterDetail memory _char = crimeChar.getCharacter(uint256(tokenIds[uint256(i)]));
                    CharacterDetailWeb memory charWeb = bridgeCharacterStructToWebStruct(_char);
                    result[resultIndex] = charWeb;
                    resultIndex++;
                }
            }
            return result;
        }
    }

    function getAllCharactersByTokenIds(int256 max, int256 min, int256[] memory tokenIds) public view returns (CharacterDetailWeb[] memory)
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

                    CharacterDetail memory _char = crimeChar.getCharacter(uint256(tokenIds[uint256(i)]));
                    CharacterDetailWeb memory charWeb = bridgeCharacterStructToWebStruct(_char);
                    result[resultIndex] = charWeb;
                    resultIndex++;
                }
            }
            return result;
        }
    }
}