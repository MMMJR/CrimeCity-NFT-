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
import "./utils/CharacterUtils.sol";
import "./tokens/Character.sol";
import "./tokens/GameItem.sol";
import "./tokens/GANG.sol";
import "./tokens/Factory.sol";
import "./SeasonManager.sol";

//Programar: RewardPool para o ranking
//Programar: MarketPlace
//Programar Admin: ChangeMintPrice, changeOwnerOfAllContracts;
//Programar remedios para curar vicio;

struct InGame
{
    uint256 balance;
    uint256 claimTime;
    uint256 lastClaim;
    uint256 claimTax;
    uint256 seasonSlots;
    uint256 prisonPrice;
    uint256 beer;
    uint256 cannabis;
    uint256 opio;
    uint256 cocaine;
    uint256 vip;
}

contract CoreInGame is Admin, IERC721Receiver {

    address _contractowner;
    address private _secondowner;

    uint256 private bnbBalance;

    mapping(address => InGame) private _IngameAccount;


    Utils private utils;
    Character private crimeChar;
    CharacterUtils private charUtils;
    GameItem private crimeItem;
    Factory private crimeFactory;
    GANG private gangToken;
    bool private Initialized;
    SeasonManager private season;

    uint256 private investersId = 0;

    //finalize season, burnMarket, resetAccsInGame, burnAllInvesters

    constructor(Utils _util, GANG _gangToken, Character _character, GameItem _gameItem, CharacterUtils _charUtils, Factory _crimeFac, SeasonManager _season) Admin()
    {
        _contractowner = msg.sender;
        _secondowner = address(YOUR SECOND OWNER WALLET);
        bnbBalance = 0;
        gangToken = _gangToken;
        crimeChar = _character;
        crimeItem = _gameItem;
        utils = _util;
        charUtils = _charUtils;
        crimeFactory = _crimeFac;
        season = _season;

        _setRoleAdmin(DEFAULT_ADMIN_ROLE, DEFAULT_ADMIN_ROLE);
        _setRoleAdmin(DEFAULT_CORE_ROLE, DEFAULT_ADMIN_ROLE);
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(DEFAULT_ADMIN_ROLE, _secondowner);
        Initialized = false;
    }

    function Initialize(address _Robbery, address _PvP, address _Equipment, address _HospitalPrice, address _Core, address _MarketPlace, address _BlackMarket) public
    {
        if(Initialized == false)
        {
            _setupRole(DEFAULT_CORE_ROLE, _Equipment);
            _setupRole(DEFAULT_CORE_ROLE, _HospitalPrice);
            _setupRole(DEFAULT_CORE_ROLE, _Robbery);
            _setupRole(DEFAULT_CORE_ROLE, _PvP);
            _setupRole(DEFAULT_CORE_ROLE, _Core);
            _setupRole(DEFAULT_CORE_ROLE, _MarketPlace);
            _setupRole(DEFAULT_CORE_ROLE, _BlackMarket);
            _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
            Initialized = true;
        }
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

    function resetAccsInSeason() public onlyRole(DEFAULT_ADMIN_ROLE) {
        address[] memory _Investers = season.getAllInvesters();
        for(uint256 x = 0; x < _Investers.length; x++)
        {
                _IngameAccount[_Investers[x]].seasonSlots = 0;
                _IngameAccount[_Investers[x]].prisonPrice = 0;
                _IngameAccount[_Investers[x]].beer = 0;
                _IngameAccount[_Investers[x]].cannabis = 0;
                _IngameAccount[_Investers[x]].opio = 0;
                _IngameAccount[_Investers[x]].cocaine = 0;
        }
        
    }

    function changeAdmin(address newAdmin) public onlyRole(DEFAULT_ADMIN_ROLE)
    {
        _contractowner = newAdmin;
    }

    function depositGANG(uint256 amount) public 
    {
        require(amount > 0, "Input Error");
        require(gangToken.allowance(msg.sender, address(this)) >= amount, "Require approve");
        require(gangToken.balanceOf(msg.sender) >= amount, "Insufficient Balance");
        gangToken.transferFrom(msg.sender, _contractowner, amount);
        _IngameAccount[msg.sender].balance += amount;
        if(_IngameAccount[msg.sender].claimTime == 0)
        {
            _IngameAccount[msg.sender].claimTime = block.timestamp;
        }
    }

    function checkCharacterCanRun(address addr, uint256 tokenId) public view returns(bool) {
        require(crimeChar.ownerOf(tokenId) == addr, "No Owner");
        CharacterDetail memory char = crimeChar.getCharacter(tokenId);
        gameSeason memory seasonManager = season.getSeasonManager();
        require(utils.strcmp(seasonManager.seasonState, "RUNNING"), "Season not started");
        require(char.seasonId == seasonManager.seasonId, "Character not in season");
        require(_IngameAccount[addr].seasonSlots > 0, "Season not started");
        require(char.nurseTime == 0, "Character in Hospital"); //**** */
        require(char.prisonTime == 0, "Character in Prison");
        return true;
    }

    function getSeasonId() public view returns (uint256)
    {
        gameSeason memory seasonManager = season.getSeasonManager();
        return seasonManager.seasonId;
    }

    function checkCharacterCanRunHP(address addr, uint256 tokenId) public view returns(bool) {
        require(crimeChar.ownerOf(tokenId) == addr, "No Owner");
        CharacterDetail memory char = crimeChar.getCharacter(tokenId);
        gameSeason memory seasonManager = season.getSeasonManager();
        require(utils.strcmp(seasonManager.seasonState, "RUNNING"), "Season not started");
        require(char.seasonId == seasonManager.seasonId, "Character not in season");
        require(_IngameAccount[addr].seasonSlots > 0, "Season not started");
        return true;
    }

    function claimFactory(uint256 tokenId) public {
        require(crimeFactory.ownerOf(tokenId) == msg.sender, "No Owner");
        _Factory memory fac = crimeFactory.getFactory(tokenId);
        gameSeason memory seasonManager = season.getSeasonManager();
        uint256 itemId = fac.itemIdProduce;
        require(itemId >= 10 && itemId < 14, "Cannot be Produce this item");
        require(utils.strcmp(seasonManager.seasonState, "RUNNING"), "Season not started");
        require(block.timestamp >= fac.claimTime, "Claim Time");
        fac.claimTime = block.timestamp + (1 days);
        if(itemId == 10) _IngameAccount[msg.sender].beer += fac.quantity;
        else if(itemId == 11) _IngameAccount[msg.sender].cannabis += fac.quantity;
        else if(itemId == 12) _IngameAccount[msg.sender].opio += fac.quantity;
        else _IngameAccount[msg.sender].cocaine += fac.quantity;
        crimeFactory.UpdateFactory(tokenId, fac);
    }

    function applyCharacterinSeason(uint256 tokenId) public {
        require(crimeChar.ownerOf(tokenId) == msg.sender, "Require Owner");
        CharacterDetail memory char = crimeChar.getCharacter(tokenId);
        gameSeason memory seasonManager = season.getSeasonManager();
        require(char.seasonId == 0, "Character in season");
        require(_IngameAccount[msg.sender].seasonSlots < 5, "Maximum three slots");
        require(utils.strcmp(seasonManager.seasonState, "RUNNING"), "Season not started");
        if(_IngameAccount[msg.sender].claimTime == 0)
        {
            _IngameAccount[msg.sender].claimTime = block.timestamp;
        }
        seasonManager.charactersInSeason++;
        char.seasonId = seasonManager.seasonId;
        season.UpdateSeasonManager(seasonManager, msg.sender);
        crimeChar.UpdateCharacter(tokenId, char);
        _IngameAccount[msg.sender].seasonSlots++;
    }

    function getClaimTax(address addr) public view returns (uint256) {
        uint256 returnValue = 0;
        if(_IngameAccount[addr].balance <= 0) return returnValue;
        if(block.timestamp >= _IngameAccount[addr].claimTime)
        {
            uint256 timePassed = block.timestamp - _IngameAccount[addr].claimTime;
            uint256 baseClaimTax = 75;
            uint256 dayPassed = 0;
            if(timePassed >= (1 days))
            {
                dayPassed = (timePassed / (1 days));
                dayPassed = dayPassed * 2;
                dayPassed += 1;
                if(dayPassed > 14) dayPassed = 14;
                baseClaimTax = baseClaimTax - (dayPassed * 5);
                returnValue = baseClaimTax;
            }
            returnValue = baseClaimTax;
            return returnValue;
        }
        else return returnValue;
    }

    function getClaimReal(address addr) public view returns (uint256) {
        uint256 ClaimTokens = _IngameAccount[msg.sender].balance;
        uint256 returnValue = 0;
        if(_IngameAccount[addr].balance <= 0) return returnValue;
        if(block.timestamp >= _IngameAccount[addr].claimTime && ClaimTokens > 0)
        {
            uint256 timePassed = block.timestamp - _IngameAccount[addr].claimTime;
            uint256 baseClaimTax = 75;
            uint256 dayPassed = 0;
            uint256 receiveTokens = 0;
            if(timePassed >= (1 days))
            {
                dayPassed = (timePassed / (1 days));
                dayPassed = dayPassed * 2;
                dayPassed += 1;
                if(dayPassed > 14) dayPassed = 14;
                baseClaimTax = baseClaimTax - (dayPassed * 5);
            }
            receiveTokens = ((ClaimTokens * (100 - baseClaimTax)) / 100);
            returnValue = receiveTokens;
            return returnValue;
        }
        else return returnValue;
    }

    function claim() public payable {
        require(msg.value >= utils.getContractValue(), "Inssuficient Ammount");
        require(_IngameAccount[msg.sender].balance >= utils.getMinToClaim(), "Min to Claim");
        require(block.timestamp >= _IngameAccount[msg.sender].claimTime, "Need more Time");
        uint256 ClaimTokens = _IngameAccount[msg.sender].balance;

        require(gangToken.balanceOf(_contractowner) >= ClaimTokens, "Require Contract Balance");

        uint256 receiveTokens = getClaimReal(msg.sender);

        _IngameAccount[msg.sender].balance = 0;
        _IngameAccount[msg.sender].claimTime = 0;
        bnbBalance += msg.value;
        gangToken.transferFrom(_contractowner, msg.sender, receiveTokens);
    }

    function getIngameAccount(address addr) public view returns (InGame memory)
    {
        return _IngameAccount[addr];
    }

    function UpdateInGameAccount(address addr, InGame memory acc) onlyCore() public {
        _IngameAccount[addr] = acc;
        _IngameAccount[addr].vip = 0;
        uint256 balanceOfCharacters = crimeChar.balanceOf(addr);

        if(balanceOfCharacters >= 5 && balanceOfCharacters < 10)
        {
            _IngameAccount[addr].vip = 1;
        }
        else if(balanceOfCharacters >= 10 && balanceOfCharacters < 15)
        {
            _IngameAccount[addr].vip = 2;
        }
        else if(balanceOfCharacters >= 15)
        {
            _IngameAccount[addr].vip = 3;
        }
        else _IngameAccount[addr].vip = 0;
    }

    function getRemaingClaimTime(address addr) public view returns (int256)
    {
        return int256(block.timestamp - _IngameAccount[addr].claimTime);
    }

    function canClaim(address addr) public view returns (bool)
    {
        return (block.timestamp >= _IngameAccount[addr].claimTime);
    }

    function mintGameItem(uint256 itemId) public payable {
        require(msg.value >= utils.getContractValue(), "Incorrect Value");
        require(crimeItem.checkItemListCanMint(itemId), "Cannot be Mint");
        uint256 totalPrice = crimeItem.getItemPrice(itemId);
        require(_IngameAccount[msg.sender].balance >= totalPrice, "Inssuficient Ammount");
        _IngameAccount[msg.sender].balance -= totalPrice;
        crimeItem.mint(msg.sender, itemId);
        bnbBalance += msg.value;
    }
}