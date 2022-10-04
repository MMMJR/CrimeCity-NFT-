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

contract CharacterUtils is Admin, IERC721Receiver {
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

    function Initialize(address _Core, address _CoreIn, address _Robbery, address _PvP, address _Equipment) public
    {
        if(Initialized == false)
        {
            _setupRole(DEFAULT_CORE_ROLE, _Core);
            _setupRole(DEFAULT_CORE_ROLE, _CoreIn);
            _setupRole(DEFAULT_CORE_ROLE, _Robbery);
            _setupRole(DEFAULT_CORE_ROLE, _PvP);
            _setupRole(DEFAULT_CORE_ROLE, _Equipment);
            _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
            Initialized = true;
        }
    }
    function createExpedition(address addr, uint256 tokenId) onlyCore() public returns (uint256){
        uint256 returnValue = 0;

        if(crimeChar.ownerOf(tokenId) != addr) return returnValue;

        CharacterDetail memory char = crimeChar.getCharacter(tokenId);

        if((block.timestamp < char.lastExpedition) && (char.lastExpedition != 0)) return returnValue;

        char.lastExpedition = block.timestamp + (1 days);

        crimeChar.UpdateCharacter(tokenId, char);
        returnValue = 10;

        return returnValue;
    }

    function createPvP(address addr, uint256 tokenId) onlyCore() public returns (uint256){
        uint256 returnValue = 0;

        if(crimeChar.ownerOf(tokenId) != addr) return returnValue;
        CharacterDetail memory char = crimeChar.getCharacter(tokenId);

        if((block.timestamp < char.lastPvP) && (char.lastPvP != 0)) return returnValue;

        char.lastPvP = block.timestamp + (1 days);

        crimeChar.UpdateCharacter(tokenId, char);
        returnValue = 10;

        return returnValue;
    }

    function UpdateCharacterItemBonus(uint256 tokenId, uint256 gameItemTokenId) onlyCore() public
    {
        CharacterDetail memory char = crimeChar.getCharacter(tokenId);

        if(gameItemTokenId == 0)
        {
            uint256 weaponId = char.weaponId;
            _GameItem memory item = crimeItem.getGameItem(weaponId);
            char.power += item.powerBonus;
            char._str += item.strBonus;
            char._int += item.intBonus;
            char._cha += item.chaBonus;
            char._res += item.resBonus;
        }
        else
        {
            _GameItem memory item = crimeItem.getGameItem(gameItemTokenId);
            char.power -= item.powerBonus;
            char._str -= item.strBonus;
            char._int -= item.intBonus;
            char._cha -= item.chaBonus;
            char._res -= item.resBonus;
        }
        crimeChar.UpdateCharacter(tokenId, char);
    }

    function UpdateExpeditioResult(CharacterDetail memory char, uint256 result, uint256 roll, uint256 _exp, uint256 _respect, uint256 baseDamage) onlyCore() public returns (uint256) {
        char.lastExpeditionResult = result;
        char.respect += _respect;
        char.exp += _exp;
        char.lastExpeditionRoll = roll;
        uint256 returnValue = 0;
        if(char.exp >= utils.getExperienceTable(char.level))
        {
            char.level++; //level
            // (1 = ladrao, 2 = gangster, 3 = empresario, 4 = traficante)
            if(char.class == 1) char._str += 1;
            else if(char.class == 2) char._int += 1;
            else if(char.class == 3) char._cha += 1;
            else char._res += 1;

            char.maxHp += 50;
            char._str += 1;
            char._int += 1;
            char._cha += 1;
            char._res += 1;
            char.curHp = char.maxHp;
            char.power += (char.power / 100); // 1% de more Power
        }

        if(char.level <= 2) baseDamage = ((char.maxHp * 30) / 100);

        if(char.coleteTime > block.timestamp) baseDamage = baseDamage / 2; //Colete
        else char.coleteTime = 0;
        
        if(baseDamage >= char.curHp)
        {
            char.curHp = 0; //curHP
            char.nurseTime = block.timestamp + (1 days) + (12 hours); // Nurse
            char.prisonTime = 0; // Prison
            char.hospitalPrice = ((char.power / 100) * (utils.getMintPrice() / 65));
            returnValue = 1;
        }
        else
        {
            char.curHp -= baseDamage;
        }
        char.maxHp += baseDamage;
        if(returnValue == 0 && result != 100)
        {
            uint256 _rd = utils.rand(100);
            if(_rd <= utils.getBasePrisonChance(char.rarity, char.vicio))
            {
                char.prisonTime = block.timestamp + (1 days) + (12 hours); //Prison
                char.nurseTime = 0;
                char.prisonPrice = ((char.power / 100) * (utils.getMintPrice() / 65));
            }
            returnValue = 2;
        }
        crimeChar.UpdateCharacter(char.tokenId, char);
        return returnValue;
    }

    function UpdatePvPHPResult(CharacterDetail memory attacker, CharacterDetail memory defensor, uint256 baseDamage, uint256 defDamage) internal {
        uint256 bDmg = baseDamage;
        uint256 dDmg = defDamage;

        if(attacker.coleteTime > block.timestamp) bDmg = ((bDmg * 65) / 100); //Colete
        else attacker.coleteTime = 0;

        if(defensor.coleteTime > block.timestamp) dDmg = ((dDmg * 65) / 100); //Colete def
        else defensor.coleteTime = 0;
        
        if(dDmg >= attacker.curHp)
        {
            attacker.curHp = 0; //curHP
            attacker.nurseTime = block.timestamp + (1 days) + (12 hours); // Nurse
            attacker.prisonTime = 0; // Prison
            attacker.hospitalPrice = ((attacker.power / 100) * utils.getMintPrice() / 65);
        }
        else
        {
            attacker.curHp -= dDmg;
        }

        if(bDmg >= defensor.curHp)
        {
            defensor.curHp = 0; //curHP
            defensor.nurseTime = block.timestamp + (1 days) + (12 hours); // Nurse
            defensor.prisonTime = 0; // Prison
            defensor.hospitalPrice = ((defensor.power / 100) * utils.getMintPrice() / 65);
        }
        else
        {
            defensor.curHp -= bDmg;
        }

        crimeChar.UpdateCharacter(attacker.tokenId, attacker);
        crimeChar.UpdateCharacter(defensor.tokenId, defensor);
    }

    function UpdatePvPResult(CharacterDetail memory attacker, CharacterDetail memory defensor, uint256 result) onlyCore() public returns (uint256) {
        uint256 baseDamage = 0;
        uint256 defDamage = 0;
        attacker.lastPvPResult = result;

        if(result == 100)
        {
            attacker.respect += ((defensor.respect * 40) / 100); //respect 
            attacker.exp += 7; //exp
            if(attacker.respect / 10 > defensor.respect) defensor.respect = 0;
            else defensor.respect -= attacker.respect / 10;
            
            if(attacker.exp >= utils.getExperienceTable(attacker.level))
            {
                attacker.level++; //level
                // (1 = ladrao, 2 = gangster, 3 = empresario, 4 = traficante)
                if(attacker.class == 1) attacker._str += 1;
                else if(attacker.class == 2) attacker._int += 1;
                else if(attacker.class == 3) attacker._cha += 1;
                else attacker._res += 1;

                attacker._str += 1;
                attacker._int += 1;
                attacker._cha += 1;
                attacker._res += 1;
                attacker.curHp = attacker.maxHp;
                attacker.power += (attacker.power / 100); // 1% de more Power9***
            }
            baseDamage = ((defensor.maxHp * (2 + utils.rand(6))) / 100);
            defDamage = ((attacker.maxHp * (4 + utils.rand(10))) / 100);
        }
        else
        {
            defensor.respect += ((defensor.respect * 25) / 100); //respect 
            if(defensor.respect / 10 > attacker.respect) attacker.respect = 0;
            else attacker.respect -= attacker.respect / 10;
            defensor.exp += 2;
            if(defensor.exp >= utils.getExperienceTable(defensor.level))
            {
                defensor.level++; //level
                // (1 = ladrao, 2 = gangster, 3 = empresario, 4 = traficante)
                if(defensor.class == 1) defensor._str += 1;
                else if(defensor.class == 2) defensor._int += 1;
                else if(defensor.class == 3) defensor._cha += 1;
                else defensor._res += 1;

                defensor._str += 1;
                defensor._int += 1;
                defensor._cha += 1;
                defensor._res += 1;
                defensor.curHp = defensor.maxHp;
                defensor.power += (defensor.power / 100); // 1% de more Power
            }
            baseDamage = ((defensor.maxHp * (4 + utils.rand(10))) / 100);
            defDamage = ((attacker.maxHp * (2 + utils.rand(6))) / 100);
        }

        UpdatePvPHPResult(attacker, defensor, baseDamage, defDamage);
        
        uint256 returnValue = 0;
        return returnValue;
    }
}