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
import "./tokens/GANG.sol";
import "./tokens/GameItem.sol";
import "./tokens/Factory.sol";

struct gameSeason
{
    uint256 seasonId;
    uint256 charactersInSeason;
    uint256 seasonTime;
    uint256 seasonStart;
    string seasonState;
}

struct investers 
{
    address invester;
    uint256 active;
}

contract SeasonManager is Admin, IERC721Receiver {
    

    address _contractowner;
    address private _secondowner;

    uint256 private bnbBalance;

    gameSeason private seasonManager;
    mapping(uint256 => investers) private _Investers;
    uint256 private investersId = 0;

    Utils private utils;
    Character private crimeChar;
    GameItem private crimeItem;
    Factory private crimeFactory;
    bool private Initialized;

    constructor(Utils _util, Character _character, GameItem _gameItem, Factory _crimeFac) Admin()
    {
        _contractowner = msg.sender;
        _secondowner = address(YOUR SECOND OWNER WALLET);
        bnbBalance = 0;
        crimeChar = _character;
        crimeItem = _gameItem;
        utils = _util;
        crimeFactory = _crimeFac;

        seasonManager = gameSeason(1, 0, 0, 0, "Init");

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

    function Initialize(address _CoreIn) public
    {
        if(Initialized == false)
        {
            _setupRole(DEFAULT_CORE_ROLE, _CoreIn);
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

    function getSeasonDaysLeft() public view returns (uint256)
    {
        uint256 result = 0;
        if(seasonManager.seasonTime > block.timestamp)
        {
            uint256 diff= seasonManager.seasonTime - block.timestamp;
            diff = diff / (1 days);
            result = diff;
        }
        return result;
    }

    function getSeasonState() public view returns (string memory)
    {
        return seasonManager.seasonState;
    }

    function finalizeSeason() onlyRole(DEFAULT_ADMIN_ROLE) public
    {
        require(utils.strcmp(seasonManager.seasonState, "RUNNING"), "Season not started");
        seasonManager.seasonState = "Init";
        seasonManager.seasonStart = 0;
        seasonManager.seasonTime = 0;
        seasonManager.charactersInSeason = 0;
        crimeFactory.burnAllFactorysInSeason();
        crimeChar.burnAllCharactersInSeason();
        crimeItem.burnAllItemsInSeason();
    }

    function getIndexSlot() public view returns (uint256)
    {
        uint256 result = investersId;
        for(uint256 x = 0; x <= investersId; x++)
        {
            if(!_exists(x))
            {
                result = x;
                return result;
            }
        }
        return result;
    }

    function getInvestersId() public view returns(uint256)
    {
        return investersId;
    }

    function getAllInvesters() public view returns(address[] memory)
    {
        uint256 length = 0;
        if(investersId == 0)
        {
            return new address[](0);
        }
        for(uint256 x = 0; x < investersId; x++)
        {
            if(_exists(x))
            {
                length++;
            }
        }
        address[] memory _investers = new address[](length);
        uint256 resultIndex = 0;
        for(uint256 x = 0; x < investersId; x++)
        {
            if(_exists(x) && resultIndex < length)
            {
                _investers[resultIndex] = _Investers[x].invester;
                resultIndex++;
            }
        }
        if(resultIndex != length) return new address[](0);
        
        return _investers;
    }

    function _exists(uint256 id) public view returns(bool) {
        return (_Investers[id].active == 1);
    }

    function burnInvesters() public onlyRole(DEFAULT_ADMIN_ROLE)
    {
        for(uint256 x = 1; x < investersId; x++)
        {
            if(_exists(x))
            {
                _Investers[x].active = 0;
            }
        }
    }

    function checkExistInvester(address addr) public view returns(bool)
    {
        bool result = false;
        for(uint256 x = 0; x < investersId; x++)
        {
            if(_Investers[x].invester == addr)
            {
                result = true;
                return result;
            }
        }
        return result;
    }

    function InitializeSeason(bool _new) onlyRole(DEFAULT_ADMIN_ROLE) public {
        require(utils.strcmp(seasonManager.seasonState, "Init"), "Season not started");
        seasonManager.seasonState = "RUNNING";
        seasonManager.seasonStart = block.timestamp;
        seasonManager.seasonTime = block.timestamp + (75 * 1 days);
        if(_new) seasonManager.seasonId++;
    }

    function getSeasonManager() public view returns (gameSeason memory)
    {
        return seasonManager;
    }
    
    function UpdateSeasonManager(gameSeason memory season, address invester) public onlyCore()
    {
        if(!checkExistInvester(invester))
        {
            uint256 slot = getIndexSlot();
            _Investers[slot].invester = invester;
            if(slot == investersId) investersId++;
        }
        seasonManager = season;
    }

    function getSeasonId() public view returns (uint256)
    {
        return seasonManager.seasonId;
    }
}