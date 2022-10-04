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
import "./../utils/ItemList.sol";

import "./../Features/BlackMarket.sol";
import "./../Features/HospitalPrison.sol";

struct _GameItem
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

contract GameItem is ERC721, Admin {
    address private _contractowner;
    address private _secondowner;
    uint256 private lastSeed = 0;

    Utils private utils;
    ItemList private itemList;

    uint256 private nextId = 1;

    bool private Initialized = false;

    mapping( uint256 => _GameItem) private _tokenStorage;

    constructor(string memory name, string memory symbol, Utils _ut, ItemList _itemList) Admin() ERC721(name, symbol)
    {
        _contractowner = msg.sender;
        _secondowner = address(YOUR SECOND OWNER WALLET);
        utils = _ut;

        itemList = _itemList;

        _setRoleAdmin(DEFAULT_ADMIN_ROLE, DEFAULT_ADMIN_ROLE);
        _setRoleAdmin(DEFAULT_CORE_ROLE, DEFAULT_ADMIN_ROLE);
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(DEFAULT_ADMIN_ROLE, _secondowner);
    }

    function changeAdmin(address newAdmin) public onlyRole(DEFAULT_ADMIN_ROLE)
    {
        _contractowner = newAdmin;
    }

    function Initialize(address _characterUtils, address _Core, address _CoreIn, address _Robbery, address _PvP, address _Equipment, address _HospitalPrice, address _BlackMarket) public
    {
        if(Initialized == false)
        {
            _setupRole(DEFAULT_CORE_ROLE, _characterUtils);
            _setupRole(DEFAULT_CORE_ROLE, _Core);
            _setupRole(DEFAULT_CORE_ROLE, _CoreIn);
            _setupRole(DEFAULT_CORE_ROLE, _Robbery);
            _setupRole(DEFAULT_CORE_ROLE, _PvP);
            _setupRole(DEFAULT_CORE_ROLE, _Equipment);
            _setupRole(DEFAULT_CORE_ROLE, _HospitalPrice);
            _setupRole(DEFAULT_CORE_ROLE, _BlackMarket);
            _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
            Initialized = true;
        }
    }


    function getGameItem(uint256 tokenId) public view returns (_GameItem memory)
    {
        require(_exists(tokenId), "No Exist");
        return _tokenStorage[tokenId];
    }

    function UpdateGameItem(uint256 tokenId, _GameItem memory _item) onlyCore() public
    {
        require(_exists(tokenId), "no Exist");
        _tokenStorage[tokenId] = _item;
    }

    function getItemListData(uint256 tokenId) public view returns (_ItemList memory)
    {
        require(_exists(tokenId), "No Exist");
        uint256 itemId = _tokenStorage[tokenId].itemId;
        require(itemList.checkExistItem(itemId), "No exist");
        return itemList.getItemListData(itemId);
    }

    function getContractOwner() public view returns (address)
    {
        return _contractowner;
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

    function getTotalSupply() public view returns (uint256)
    {
        return nextId;
    }
    function exists (uint256 tokenId) public view returns(bool) {
        return _exists(tokenId);
    }

    function checkItemIsEquiped(uint256 tokenId) public view returns (bool)
    {
        return _tokenStorage[tokenId].equiped;
    }
    
    function checkItemListCanMint(uint256 itemId) public view returns (bool)
    {
        require(itemList.checkExistItem(itemId), "No exist");
        return itemList.CheckMint(itemId);
    }

    function checkWeaponList(uint256 itemId) public view returns (bool)
    {
        require(itemList.checkExistItem(itemId), "No exist");
        uint256[] memory weaponList = itemList.getWeaponList();
        bool result = false;
        for(uint256 x = 0; x < weaponList.length; x++)
        {
            if(weaponList[x] == itemId)
            {
                result = true;
            }
        }
        return result;
    }

    function getItemPrice(uint256 itemId) public view returns (uint256)
    {
        require(itemList.checkExistItem(itemId), "No exist");
        _ItemList memory item = itemList.getItemListData(itemId);
        return item.price;
    }

    function mint(address addr, uint256 itemId) onlyCore() public {
        require(itemList.checkExistItem(itemId), "No exist");
        _ItemList memory item = itemList.getItemListData(itemId);

        uint256 basePower = item.powerBonus;
        uint256 _rarity = 1;
        uint256 _str = item.strBonus;
        uint256 _int = item.intBonus;
        uint256 _cha = item.chaBonus;
        uint256 _res = item.resBonus;

        if(checkWeaponList(itemId))
        {
            uint256 _randRarity = utils.rand(100);
            if(_randRarity <= 55) _rarity = 1;
            else if(_randRarity <= 80) _rarity = 2;
            else if(_randRarity <= 95) _rarity = 3;
            else _rarity = 4;

            uint256 resultStats = 1;
            uint256 _randStats = utils.rand(100);
            if(_randStats <= 25) resultStats = 1;
            else if(_randStats <= 50) resultStats = 2;
            else if(_randStats <= 75) resultStats = 3;
            else resultStats = 4;

            if(_rarity == 2)
            {
                basePower += ((basePower * 20) / 100);
                if(resultStats == 1) _str++;
                else if(resultStats == 2) _int++;
                else if(resultStats == 3) _cha++;
                else _res++;
            }
            else if(_rarity == 3)
            {
                basePower += ((basePower * 45) / 100);
                if(resultStats == 1)
                {
                    _str++;
                    _str++;
                    _int++;
                    _cha++;
                }
                else if(resultStats == 2)
                {
                    _int++;
                    _int++;
                    _cha++;
                    _res++;
                } 
                else if(resultStats == 3)
                {
                    _cha++;
                    _cha++;
                    _res++;
                    _str++;
                } 
                else
                {
                    _res++;
                    _res++;
                    _str++;
                    _int++;
                } 
            }
            else if(_rarity == 4)
            {
                basePower += ((basePower * 75) / 100);
                _str += 3;
                _int += 3;
                _cha += 3;
                _res += 3;
                if(resultStats == 1) _str++;
                else if(resultStats == 2) _int++;
                else if(resultStats == 3) _cha++;
                else _res++;
            }
        }

        uint256 slot = getIndexSlot();
        _tokenStorage[slot] = _GameItem(item.name, _rarity, item.img, basePower, _str, _int, _cha, _res, addr, itemId, slot, false, 0); 
        _mint(addr, slot);
        if(slot == nextId) nextId++;
    }

    function transferFromAll(
        address from,
        address to,
        uint256[] memory tokenIds
    ) public onlyRole(DEFAULT_CORE_ROLE) {
        if(tokenIds.length <= 0) return;
        for(uint256 x = 0; x < tokenIds.length; x++)
        {
            transferFrom(from, to, tokenIds[x]);
        }
    }
    
    function burnAllItemsInSeason() onlyCore() public {
        for(uint256 x = 1; x < nextId; x++)
        {
            if(_exists(x))
            {
                _burn(x);
            }
        }
    }
    
    function burn(uint256 tokenId) onlyCore() public {
        _burn(tokenId);
    }

    function burnItems(uint256[] memory tokenIds) onlyCore() public {
        for(uint256 x = 0; x < tokenIds.length; x++)
        {
            _burn(tokenIds[x]);
        }
    }

    function _beforeTokenTransfer( address from, address to, uint256 tokenId) internal override {
        _GameItem storage _item = _tokenStorage[tokenId];
        require(_item.equiped == false, "no transfer");
        _item.owner = to;
        //require(Char.lastMeal + Char.endurance > block.timestamp);
    }
}