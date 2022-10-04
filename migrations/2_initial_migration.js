const Utils = artifacts.require("Utils");
const ItemList = artifacts.require("ItemList");
const GANG = artifacts.require("GANG");
const Character = artifacts.require("Character");
const Factory = artifacts.require("Factory");
const MarketPlace = artifacts.require("MarketPlace");
const SeasonManager = artifacts.require("SeasonManager");
const GameItem = artifacts.require("GameItem");
const WebUtils = artifacts.require("WebUtils");
const Ranking = artifacts.require("Ranking");
const CharacterUtils = artifacts.require("CharacterUtils");
const Trade = artifacts.require("Trade");
const Core = artifacts.require("Core");
const CoreInGame = artifacts.require("CoreInGame");
const BlackMarket = artifacts.require("BlackMarket");
const Equipment = artifacts.require("Equipment");
const HospitalPrison = artifacts.require("HospitalPrison");
const Robbery = artifacts.require("Robbery");
const PvP = artifacts.require("PvP");

module.exports = async function (deployer) {

  await deployer.deploy(Utils);
  let _Utils = await Utils.deployed();

  await deployer.deploy(ItemList);
  let _ItemList = await ItemList.deployed();

  await deployer.deploy(GANG);
  let _GANG = await GANG.deployed();

  await deployer.deploy(Character, "CrimesCity Character", "CCCHAR", _Utils.address);
  let _Character = await Character.deployed();

  await deployer.deploy(GameItem, "CrimesCity Item", "CCITEM", _Utils.address, _ItemList.address);
  let _GameItem = await GameItem.deployed();

  await deployer.deploy(Factory, "CrimesCity Factory", "CCFAC", _Utils.address, _ItemList.address);
  let _Factory = await Factory.deployed();

  await deployer.deploy(WebUtils, _Utils.address, _Character.address, _GameItem.address);
  let _WebUtils = await WebUtils.deployed();

  await deployer.deploy(Ranking, _Utils.address, _Character.address);
  let _Ranking = await Ranking.deployed();

  await deployer.deploy(CharacterUtils, _Utils.address, _Character.address, _GameItem.address);
  let _CharacterUtils = await CharacterUtils.deployed();

  await deployer.deploy(Trade, _GANG.address, _Utils.address);
  let _Trade = await Trade.deployed();

  await deployer.deploy(SeasonManager, _Utils.address, _Character.address, _GameItem.address, _Factory.address);
  let _SeasonManager = await SeasonManager.deployed();

  await deployer.deploy(CoreInGame, _Utils.address, _GANG.address, _Character.address, _GameItem.address, _CharacterUtils.address, _Factory.address, _SeasonManager.address);
  let _CoreInGame = await CoreInGame.deployed();

  await deployer.deploy(Core, _Utils.address, _GANG.address, _Character.address, _GameItem.address, _CoreInGame.address, _Factory.address, _SeasonManager.address);
  let _Core = await Core.deployed();

  await deployer.deploy(MarketPlace, _GANG.address, _Utils.address, _Character.address, _GameItem.address, _CoreInGame.address, _ItemList.address);
  let _MarketPlace = await MarketPlace.deployed();
  
  await deployer.deploy(BlackMarket, _Utils.address, _GANG.address, _GameItem.address, _SeasonManager.address, _CoreInGame.address);
  let _BlackMarket = await BlackMarket.deployed();

  await deployer.deploy(Equipment, _Utils.address, _Character.address, _GameItem.address, _CharacterUtils.address, _CoreInGame.address);
  let _Equipment = await Equipment.deployed();

  await deployer.deploy(HospitalPrison, _Utils.address, _Character.address, _GameItem.address, _CoreInGame.address);
  let _HospitalPrison = await HospitalPrison.deployed();

  await deployer.deploy(Robbery, _Utils.address, _Character.address, _GameItem.address, _CharacterUtils.address, _CoreInGame.address);
  let _Robbery = await Robbery.deployed();

  await deployer.deploy(PvP, _Utils.address, _Character.address, _GameItem.address, _CharacterUtils.address, _CoreInGame.address);
  let _PvP = await PvP.deployed();

  await _GameItem.Initialize(_CharacterUtils.address, _Core.address, _CoreInGame.address, _Robbery.address, _PvP.address, _Equipment.address, _HospitalPrison.address, _BlackMarket.address);
  await _Character.Initialize(_CharacterUtils.address, _Ranking.address, _Core.address, _CoreInGame.address, _Robbery.address, _PvP.address, _Equipment.address, _HospitalPrison.address);
  await _Factory.Initialize(_Core.address, _CoreInGame.address);
  await _SeasonManager.Initialize(_CoreInGame.address);
  await _CharacterUtils.Initialize(_Core.address, _CoreInGame.address, _Robbery.address, _PvP.address, _Equipment.address);
  await _Core.Initialize(_Robbery.address, _PvP.address, _Equipment.address, _HospitalPrison.address);
  await _CoreInGame.Initialize(_Robbery.address, _PvP.address, _Equipment.address, _HospitalPrison.address, _Core.address, _MarketPlace.address, _BlackMarket.address);

  console.log("##############################################");
  console.log("########    SUCESSUFUL DEPLOYMENT     ########");
  console.log("##############################################");
};
