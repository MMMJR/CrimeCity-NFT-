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

import "./Admin.sol";

struct _ItemList
{
    string name;
    uint256 img;
    uint256 powerBonus;
    uint256 strBonus;
    uint256 intBonus;
    uint256 chaBonus;
    uint256 resBonus;
    uint256 price;
    bool canMint;
}

contract ItemList is Admin {
    address private _contractowner;
    address private _secondowner;

    uint256 private maxItemList = 0;

    
    uint256 mintPrice = 15000000000000000000;
    
    uint256[] private weapons = [
             0, 1, 2, 3, 4,
             5, 6, 7, 8, 9 ];

    uint256 private nextId = 0;

    mapping( uint256 => _ItemList) private _itemList;

    constructor() Admin()
    {
        _secondowner = address(0xbf752Eb4b851B241A36e22767b304ef28242198A);
        _contractowner = msg.sender;
        _setRoleAdmin(DEFAULT_ADMIN_ROLE, DEFAULT_ADMIN_ROLE);
        _setRoleAdmin(DEFAULT_CORE_ROLE, DEFAULT_ADMIN_ROLE);
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(DEFAULT_ADMIN_ROLE, _secondowner);

        uint256 power = 10;
        uint256 r = mintPrice;

        _itemList[0] = _ItemList("Baseball bat", 0, power, 0, 0, 0, 0, (r / 43), true);
        power += 7;
        _itemList[1] = _ItemList("Brass knuckles", 1, power, 0, 0, 0, 0, (r / 35), true);
        power += 10;
        _itemList[2] = _ItemList("Knife", 2, power, 0, 0, 0, 0, (r / 23), true);
        power += 10;
        _itemList[3] = _ItemList("Grenade", 3, power, 0, 0, 0, 0, (r / 15), true);
        power += 15;
        _itemList[4] = _ItemList("Glock", 4, power, 1, 1, 1, 1, (r / 8), true);
        power += 12;
        _itemList[5] = _ItemList("Desert Eagle", 5, power, 1, 1, 1, 1, (r / 6), true);
        power += 12;
        _itemList[6] = _ItemList("MP5", 6, power, 2, 2, 2, 2, (r / 3), true);
        power += 10;
        _itemList[7] = _ItemList("P90", 7, power, 3, 3, 3, 3, (r / 2), true);
        power += 12;
        _itemList[8] = _ItemList("M4A1", 8, power, 3, 3, 3, 3, r, true);
        power += 10;
        _itemList[9] = _ItemList("AK-47", 9, power, 5, 5, 5, 5, (r + ((r * 20) / 100)), true);
        _itemList[10] = _ItemList("Beer", 9, 0, 0, 0, 0, 0, 0, false);
        _itemList[11] = _ItemList("Cannabis", 9, 0, 0, 0, 0, 0, 0, false);
        _itemList[12] = _ItemList("Opio", 9, 0, 0, 0, 0, 0, 0, false);
        _itemList[13] = _ItemList("Cocaine", 9, 0, 0, 0, 0, 0, 0, false);
        nextId = 14;
    }

    function changeAdmin(address newAdmin) public onlyRole(DEFAULT_ADMIN_ROLE)
    {
        _contractowner = newAdmin;
    }

    function getMaxItemList() public view returns (uint256)
    {
        return nextId;
    }

    function CheckMint(uint256 tokenId) public view returns (bool)
    {
        require(tokenId >= 0 && tokenId < nextId, "Input Incorrect");
        return _itemList[tokenId].canMint;
    }

    function checkExistItem(uint256 tokenId) public view returns (bool)
    {
        if(tokenId >= 0 && tokenId < nextId)
        {
            return true;
        }
        else return false;
    }

    function getItemListData(uint256 itemId) public view returns (_ItemList memory)
    {
        require(itemId >= 0 && itemId < nextId, "Input Incorrect");
        _ItemList memory result = _itemList[itemId];
        return result;
    }

    function getAllItemDataByTokenIds(int256[] memory tokenIds) public view returns (_ItemList[] memory)
    {
        uint256 tokenCount = tokenIds.length;

        if(tokenCount == 0)
        {
            return new _ItemList[](0);
        }
        else
        {
            _ItemList[] memory result = new _ItemList[](tokenCount);
            int256 i;
            uint256 resultIndex = 0;
            for(i = 0; i < int256(tokenIds.length); i++)
            {
                if(i >= 0)
                {
                    _ItemList memory itemWeb = getItemListData(uint256(i));
                    result[resultIndex] = itemWeb;
                    resultIndex++;
                }
            }
            return result;
        }
    }

    function getWeaponList() public view returns (uint256[] memory)
    {
        return weapons;
    }
    
    function addItem(string memory name, uint256 _img, uint256 respect, uint256 _str, uint256 _cha, uint256 _int, uint256 _res, uint256 _price, bool _canMint) onlyRole(DEFAULT_ADMIN_ROLE) public
    {
        _addItem(name, _img, respect, _str, _cha, _int, _res, _price, _canMint);
    }

    function _addItem(string memory name, uint256 _img, uint256 respect, uint256 _str, uint256 _cha, uint256 _int, uint256 _res, uint256 _price, bool _canMint) internal
    {
        _itemList[nextId] = _ItemList(name, _img, respect, _str, _cha, _int, _res, _price, _canMint);
        nextId++;
    }
}