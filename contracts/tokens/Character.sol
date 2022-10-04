// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.4.22 <0.9.0;

/**
 * @title SampleBEP20Token
 * @dev Very simple BEP20 Token example, where all tokens are pre-assigned to the creator.
 * Note they can later distribute these tokens as they wish using `transfer` and other
 * `BEP20` functions.
 * USE IT ONLY FOR LEARNING PURPOSES. SHOULD BE MODIFIED FOR PRODUCTION
 */
 

import "../../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./../utils/Admin.sol";
import "./../utils/Utils.sol";

struct CharacterDetail
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

contract Character is ERC721, Admin {
    address private _contractowner;
    address private _secondowner;
    uint256 private lastSeed = 0;

    Utils private utils;

    uint256 private nextId = 1;

    bool private Initialized;

    mapping( uint256 => CharacterDetail) private _tokenStorage;

    constructor(string memory name, string memory symbol, Utils _ut) Admin() ERC721(name, symbol)
    {
        _contractowner = msg.sender;
        _secondowner = address(YOUR SECOND OWNER WALLET);
        utils = _ut;

        _setRoleAdmin(DEFAULT_ADMIN_ROLE, DEFAULT_ADMIN_ROLE);
        _setRoleAdmin(DEFAULT_CORE_ROLE, DEFAULT_ADMIN_ROLE);
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(DEFAULT_ADMIN_ROLE, _secondowner);
        Initialized = false;
    }

    function Initialize(address _characterUtils, address _ranking, address _Core, address _CoreIn, address _Robbery, address _PvP, address _Equipment, address _HospitalPrice) public
    {
        if(Initialized == false)
        {
            _setupRole(DEFAULT_CORE_ROLE, _characterUtils);
            _setupRole(DEFAULT_CORE_ROLE, _ranking);
            _setupRole(DEFAULT_CORE_ROLE, _Core);
            _setupRole(DEFAULT_CORE_ROLE, _CoreIn);
            _setupRole(DEFAULT_CORE_ROLE, _Robbery);
            _setupRole(DEFAULT_CORE_ROLE, _PvP);
            _setupRole(DEFAULT_CORE_ROLE, _Equipment);
            _setupRole(DEFAULT_CORE_ROLE, _HospitalPrice);
            _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
            Initialized = true;
        }
    }

    function getIndexSlot() public view returns (uint256)
    {
        uint256 result = nextId;
        for(uint256 x = 1; x <= nextId; x++)
        {
            if(!_exists(x))
            {
                result = x;
                return result;
            }
        }
        return result;
    }

    function changeAdmin(address newAdmin) public onlyRole(DEFAULT_ADMIN_ROLE)
    {
        _contractowner = newAdmin;
    }

    function getCharacter(uint256 tokenId) public view returns (CharacterDetail memory)
    {
        //require(_exists(tokenId), "Non Exists");
        return _tokenStorage[tokenId];
    }
    
    function UpdateCharacter(uint256 tokenId, CharacterDetail memory _char) onlyCore() public
    {
        require(_exists(tokenId), "no Exist");
        _tokenStorage[tokenId] = _char;
    }

    function getContractOwner() public view returns (address)
    {
        return _contractowner;
    }

    function getTotalSupply() public view returns (uint256)
    {
        return nextId;
    }

    function mint(address addr, string memory _name) onlyCore() public {

        uint256 _randChar = utils.rand(100);
        uint256 _class = 1;
        uint256 _rarity = 1;

        uint256 _str;
        uint256 _int;
        uint256 _cha;
        uint256 _res;

        if(_randChar <= 25) // ladrao
        {
            _str = 5;
            _int = 3;
            _cha = 2;
            _res = 4;
            _class = 1;
        } 
        else if(_randChar <= 50) 
        {
            _str = 2;
            _int = 5;
            _cha = 4;
            _res = 3;
            _class = 2;
        }
        else if(_randChar <= 75) 
        {
            _str = 2;
            _int = 4;
            _cha = 5;
            _res = 3;
            _class = 3;
        }
        else 
        {
            _str = 4;
            _int = 3;
            _cha = 2;
            _res = 5;
            _class = 4;
        }

        uint256 _randRarity = utils.rand(100);

        if(_randRarity <= 60) _rarity = 1; //Identi
        else if(_randRarity <= 89) _rarity = 2;
        else if(_randRarity <= 96) _rarity = 3;
        else _rarity = 4;

        uint256 basePower = 0;

        if(_rarity == 1)
        {
            basePower = 75 + utils.rand(225);
        }
        else if(_rarity == 2)
        {
            basePower = 300 + utils.rand(250);
        }
        else if(_rarity == 3)
        {
            basePower = 550 + utils.rand(250);
        }
        else
        {
            basePower = 800 + utils.rand(300);
        }

        uint256 slot = getIndexSlot();

        _tokenStorage[slot] = CharacterDetail(_name, _class, _rarity, 2, 0, basePower, 1, 0, 50, 50, _str, _int, _cha, _res, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, addr, slot); 
        _mint(addr, slot);
        if(slot == nextId) nextId++;
    }

    function transferFromAll(
        address from,
        address to,
        uint256[] memory tokenIds
    ) onlyRole(DEFAULT_CORE_ROLE) public {
        if(tokenIds.length <= 0) return;
        for(uint256 x = 0; x < tokenIds.length; x++)
        {
            transferFrom(from, to, tokenIds[x]);
        }
    }
    function exists (uint256 tokenId) public view returns(bool) {
        return _exists(tokenId);
    }

    function burnAllCharactersInSeason() onlyCore() public {
        for(uint256 x = 1; x < nextId; x++)
        {
            if(_exists(x))
            {
                if(_tokenStorage[x].seasonId != 0)
                {
                    _burn(x);
                }
            }
        }
    }
    
    function burn(uint256 tokenId) onlyCore() public {
        _burn(tokenId);
    }
    
    function _beforeTokenTransfer( address from, address to, uint256 tokenId) internal override {
        CharacterDetail storage Char = _tokenStorage[tokenId];
        require(Char.weaponId == 0 && Char.seasonId == 0, "no transfer characters in season");
        Char.owner = to;
        //require(Char.lastMeal + Char.endurance > block.timestamp);
    }
}