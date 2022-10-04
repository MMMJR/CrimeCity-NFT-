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

contract Robbery is Admin, IERC721Receiver {
    address private _contractowner;
    address private _secondowner;

    struct RobberyStruct
    {
        string name;
        uint256 powerReq;
        uint256 bestStats;
        uint256 baseChance;
        uint256 reward;
        uint256 respectReward;
        uint256 baseDamage;
    }

    uint256 private robberyMaxId = 0;

    mapping( uint256 => RobberyStruct) private gameRoubo;

    uint256 private mintPrice = 15000000000000000000;

    uint256 private bnbBalance;

    bool private Initialized;

    Utils private utils;
    Character private crimeChar;
    CharacterUtils private charUtils;
    GameItem private crimeItem;
    CoreInGame private game;

    constructor(Utils _util, Character _character, GameItem _gameItem, CharacterUtils _charUtils, CoreInGame _game) Admin()
    {
        _secondowner = address(YOUR SECOND OWNER WALLET);
        _setRoleAdmin(DEFAULT_ADMIN_ROLE, DEFAULT_ADMIN_ROLE);
        _setRoleAdmin(DEFAULT_CORE_ROLE, DEFAULT_ADMIN_ROLE);
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(DEFAULT_ADMIN_ROLE, _secondowner);
        Initialized = false;

        _contractowner = msg.sender;
        bnbBalance = 0;
        crimeChar = _character;
        crimeItem = _gameItem;
        utils = _util;
        game = _game; 
        charUtils = _charUtils;

        uint256 r = mintPrice; 
        uint256 resp = 2;
        uint256 bDmg = 5;
        robberyMaxId = 20;

        gameRoubo[0] = RobberyStruct("$1,99 store", 50, 1, 75, (r / 60), resp, bDmg); 
        gameRoubo[1] = RobberyStruct("Old woman on the street", 100, 2, 75, (r / 55), resp, bDmg * 2);
        bDmg += 2;
        resp += 20;
        gameRoubo[2] = RobberyStruct("Car Radio", 150, 3, 75, (r / 50), resp, bDmg * 2);
        bDmg += 2;
        resp += 20;
        gameRoubo[3] = RobberyStruct("Taxi", 200, 4, 75, (r / 45), resp, bDmg * 2);
        bDmg += 2;
        resp += 20;
        gameRoubo[4] = RobberyStruct("Steal a house", 225, 1, 73, (r / 40), resp, bDmg * 2);
        bDmg += 2;
        resp += 20;
        gameRoubo[5] = RobberyStruct("Gas Station", 275, 2, 70, (r / 35), resp, bDmg * 2);
        bDmg += 2;
        resp += 20;
        gameRoubo[6] = RobberyStruct("Tobacco store", 325, 3, 65, (r / 32), resp, bDmg * 2);
        bDmg += 2;
        resp += 20;
        gameRoubo[7] = RobberyStruct("Kidnap", 375, 4, 63, (r / 28), resp, bDmg * 2);
        bDmg += 2;
        resp += 20;
        gameRoubo[8] = RobberyStruct("Jewelry Store", 425, 1, 60, (r / 24), resp, bDmg * 2);
        bDmg += 4;
        resp += 20;
        gameRoubo[9] = RobberyStruct("Small bank", 475, 2, 58, (r / 20), resp, bDmg * 2);
        bDmg += 4;
        resp += 20;
        gameRoubo[10] = RobberyStruct("Car dealership", 525, 3, 56, (r / 16), resp, bDmg * 2);
        bDmg += 8;
        resp += 20;
        gameRoubo[11] = RobberyStruct("Local thugs", 575, 4, 54, (r / 12), resp, bDmg * 2);
        bDmg += 8;
        resp += 20;
        gameRoubo[12] = RobberyStruct("Safe deposit", 625, 1, 52, (r / 9), resp, bDmg * 2);
        bDmg += 8;
        resp += 20;
        gameRoubo[13] = RobberyStruct("Club", 675, 2, 50, (r / 6) , resp, bDmg * 2);
        bDmg += 8;
        resp += 20;
        gameRoubo[14] = RobberyStruct("IT store", 725, 3, 49, (r / 4), resp, bDmg * 2);
        bDmg += 8;
        resp += 20;
        gameRoubo[15] = RobberyStruct("Local drug dealer", 775, 4, 47, (r / 3), resp, bDmg * 2);
        bDmg += 8;
        resp += 20;
        gameRoubo[16] = RobberyStruct("Local Mafia Boss", 850, 1, 45, (r / 2), resp, bDmg * 2);
        gameRoubo[17] = RobberyStruct("National Museum", 850, 2, 45, (r / 2), resp, bDmg * 2);
        gameRoubo[18] = RobberyStruct("Casino", 850, 3, 45, (r / 2), resp, bDmg * 2);
        gameRoubo[19] = RobberyStruct("Russo, King of Drugs", 850, 3, 45, (r / 2), resp, bDmg * 2);
    }

    function changeAdmin(address newAdmin) public onlyRole(DEFAULT_ADMIN_ROLE)
    {
        _contractowner = newAdmin;
    }

    function onERC721Received(address, address, uint256, bytes memory) public virtual override returns (bytes4) {
        return this.onERC721Received.selector;
    }

    function getRobberyList() public view returns (RobberyStruct[] memory)
    {
        RobberyStruct[] memory result = new RobberyStruct[](20);
        for(uint256 x = 0; x < 20; x++)
        {
            result[x] = gameRoubo[x];
        }
        return result;
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
    function getRobberyCountDown(uint256 tokenId) public view returns (uint256)
    {
        require(crimeChar.exists(tokenId), "No Exists");
        CharacterDetail memory char = crimeChar.getCharacter(tokenId);

        require(char.seasonId == game.getSeasonId(), "Error Season Id");
        uint256 result = 0;
        if(char.lastExpedition > block.timestamp)
        {
            uint256 diff= char.lastExpedition - block.timestamp;
            diff = diff / (1 days);
            result = diff;
        }
        return result;
    }
    function getChanceForRobbery(uint256 tokenId, uint256 expeditionId) public view returns (uint256) {
        require(crimeChar.ownerOf(tokenId) == msg.sender, "Error 1");
        require(expeditionId >= 0 && expeditionId < robberyMaxId, "Input Error");
        uint256 maxChance = 85;
        uint256 bstats = gameRoubo[expeditionId].bestStats - 1;
        CharacterDetail memory char = crimeChar.getCharacter(tokenId);
        uint256[] memory _stats = new uint256[](4);
        _stats[0] = char._str;
        _stats[1] = char._int;
        _stats[2] = char._cha;
        _stats[3] = char._res;

        uint256 chance = (_stats[bstats] / 3);

        if(chance > 18) chance = 18;

        if(char.rarity == 1) chance += 2;
        else if(char.rarity == 2) chance += 4;
        else if(char.rarity == 3) chance += 6;
        else if(char.rarity == 4) chance += 8;

        chance += gameRoubo[expeditionId].baseChance;

        if(char.vicio >= 5)
        {
            chance -= (char.vicio / 5);
        }
        
        if(gameRoubo[expeditionId].baseChance <= 60) maxChance = 70;
        if(chance > maxChance) chance = maxChance;
        return chance;
    }

    function beginRobbery(uint256 tokenId, uint256 expeditionId) public returns (uint256) {
        require(crimeChar.ownerOf(tokenId) == msg.sender, "Error 1");
        require(expeditionId >= 0 && expeditionId < robberyMaxId, "Input Error");
        require(game.checkCharacterCanRun(msg.sender, tokenId), "Not Run in this Season");

        CharacterDetail memory char = crimeChar.getCharacter(tokenId);

        require((block.timestamp >= char.lastExpedition) || (char.lastExpedition == 0), "One per Day"); //Last Expedition

        //Requerimentos para Fazer Roubo, respeito requerido, stamina requerida
        require(char.power >= gameRoubo[expeditionId].powerReq, "Require Respect");

        uint256 expeditionResult = charUtils.createExpedition(msg.sender, tokenId);
        require(expeditionResult > 0, "Expedition Failed");
        
        InGame memory acc = game.getIngameAccount(msg.sender);
        
        if(acc.claimTime == 0)
        {
            acc.claimTime = block.timestamp;
        }

        char.lastExpedition = block.timestamp + (1 days);

        uint256 exp = 3 + utils.rand(4);

        uint256[] memory returnValue = calculateRobbery(char, expeditionId, acc.vip);

        if(returnValue[0] != 100) exp = 0;

        // add InGame Balance,
        if(returnValue[0] == 100) acc.balance += gameRoubo[expeditionId].reward;
        
        game.UpdateInGameAccount(msg.sender, acc);

        charUtils.UpdateExpeditioResult(char, returnValue[0], returnValue[1], exp, gameRoubo[expeditionId].respectReward, gameRoubo[expeditionId].baseDamage);

        return returnValue[0];
    }

    function calculateRobbery(CharacterDetail memory char, uint256 expeditionId, uint256 vip) public returns(uint256[] memory) 
    {
        uint256 returnValue = 0;
        uint256 bstats = gameRoubo[expeditionId].bestStats - 1;
        uint256[] memory _stats = new uint256[](4);
        _stats[0] = char._str;
        _stats[1] = char._int;
        _stats[2] = char._cha;
        _stats[3] = char._res;
        uint256 maxChance = 80;

        uint256 chance = (_stats[bstats] / 3);

        if(chance > 18) chance = 18;

        if(char.class == 1) chance += 2;
        else if(char.class == 2) chance += 4;
        else if(char.class == 2) chance += 6;
        else if(char.class == 2) chance += 8;

        chance += vip * 3;

        chance += gameRoubo[expeditionId].baseChance;

        if(char.vicio >= 5)
        {
            chance -= (char.vicio / 5);
        }
        
        if(gameRoubo[expeditionId].baseChance <= 60) maxChance = 70;
        if(chance > maxChance) chance = maxChance;

        uint256[] memory result = new uint256[](2);

        uint256 _random = utils.rand(90);
        if(_random <= chance)
        {
            returnValue = 100;
        }
        result[0] = returnValue;
        result[1] = _random;
        return result;
    }
}