//MMMJR

var CurrentScene = "home";
var CurrentSubScene = "jornal";
var bnbContract = null;
var utilsContract;
var itemlistContract;
var gangContract;
var characterContract;
var gameitemContract;
var factoryContract;
var seasonContract;
var marketplaceContract;
var blackmarketContract;
var webutilsContract;
var rankingContract;
var characterutilsContract;
var coreContract;
var coreingameContract;
var equipmentContract;
var hospitalprisonContract;
var robberyContract;
var pvpContract;
//MMMJR

var Config = {
    utils: "",
    itemlist: "",
    gang: "",
    character: "",
    gameitem: "",
    webutils: "",
    characterutils: "",
    factory: "",
    market: "",
    seasonManager: "",
    core: "",
    coreingame: "",
    equipment: "",
    hospitalprison: "",
    ranking: "",
    blackmarket: "",
    robbery: "",
    trade: "",
    pvp: "",
    gasPriceVeryFast: "",
    gasLimitVeryFast: "",
    gasPriceFast: "",
    web: "",
    gasLimitFast: "",
    shopTab: 1,
    invTab: 1,
    filter: 1,
    pages: 1,
    pages_equip: 1,
    pages_shop: 1,
    pages_fac: 1,
    pageId: 1,
    pageId_equip: 1,
    pageId_shop: 1,
    pageId_fac: 1,
    mintx: 1,
    selectedItemId: 10,
    selectedTokenId: 0,
    nftType: 2
}

async function GlobalSettings()
{
    //$("#metamask-str").html("");
    var Configs = await fetchExam("config.json");

    Config.utils = Configs.Config[0].utils;
    Config.itemlist = Configs.Config[0].itemlist;
    Config.gang = Configs.Config[0].gang;
    Config.character = Configs.Config[0].character;
    Config.gameitem = Configs.Config[0].gameitem;
    Config.webutils = Configs.Config[0].webutils;
    Config.characterutils = Configs.Config[0].characterutils;
    Config.core = Configs.Config[0].core;
    Config.coreingame = Configs.Config[0].coreingame;
    Config.equipment = Configs.Config[0].equipment;
    Config.hospitalprison = Configs.Config[0].hospitalprison;
    Config.robbery = Configs.Config[0].robbery;
    Config.pvp = Configs.Config[0].pvp;
    Config.trade = Configs.Config[0].trade;
    Config.market = Configs.Config[0].marketplace;
    Config.factory = Configs.Config[0].factory;
    Config.seasonManager = Configs.Config[0].seasonmanager;
    Config.ranking = Configs.Config[0].ranking;
    Config.blackmarket = Configs.Config[0].blackmarket;

}

async function LoadContracts()
{
    let erc20abi = await getERC20Abi();

    utilsContract = new web3.eth.Contract(await getAbi("Utils"), Config.utils);
    itemlistContract = new web3.eth.Contract(await getAbi("ItemList"), Config.itemlist);
    gangContract = new web3.eth.Contract(await getAbi("GANG"), Config.gang);
    characterContract = new web3.eth.Contract(await getAbi("Character"), Config.character);
    gameitemContract = new web3.eth.Contract(await getAbi("GameItem"), Config.gameitem);
    webutilsContract = new web3.eth.Contract(await getAbi("WebUtils"), Config.webutils);
    characterutilsContract = new web3.eth.Contract(await getAbi("CharacterUtils"), Config.characterutils);
    coreContract = new web3.eth.Contract(await getAbi("Core"), Config.core);
    coreingameContract = new web3.eth.Contract(await getAbi("CoreInGame"), Config.coreingame);
    equipmentContract = new web3.eth.Contract(await getAbi("Equipment"), Config.equipment);
    hospitalprisonContract = new web3.eth.Contract(await getAbi("HospitalPrison"), Config.hospitalprison);
    rankingContract = new web3.eth.Contract(await getAbi("Ranking"), Config.ranking);
    robberyContract = new web3.eth.Contract(await getAbi("Robbery"), Config.robbery);
    pvpContract = new web3.eth.Contract(await getAbi("PvP"), Config.pvp);
    factoryContract = new web3.eth.Contract(await getAbi("Factory"), Config.factory);
    seasonContract = new web3.eth.Contract(await getAbi("SeasonManager"), Config.seasonManager);
    marketplaceContract = new web3.eth.Contract(await getAbi("MarketPlace"), Config.market);
    blackmarketContract = new web3.eth.Contract(await getAbi("BlackMarket"), Config.blackmarket);

}

const getWeb3 = () => {
    return new Promise((resolve, reject) => {
      window.addEventListener("load", async () => {
        if (window.ethereum) {
          const web3 = new Web3(window.ethereum);
          try {
            // ask user permission to access his accounts
            await window.ethereum.request({ method: "eth_requestAccounts" });
            resolve(web3);
          } catch (error) {
            reject(error);
          }
        } else {
          reject("Must install MetaMask");
        }
      });
    });
  };


async function ApplicationInit()
{
    $("#scene_season_apply").hide();
    $("#scene_game").hide();
    $("#pages-enable").hide();
    $("#pages-shop-enable").hide();
    $("#pages-equip-enable").hide();
    
    await GlobalSettings();

    window.web3 = await getWeb3();
    
    $("#metamask-str").html("Connect MetaMask");
    
    var acc = ethereum.selectedAddress;
    if(acc == null)
    {
        $("#metamask-str").html("Metamask");
        window.web3 = await getWeb3();
    }
    acc = ethereum.selectedAddress;
    if(acc == null)
    {
        $("#metamask-str").html("Metamask");
        window.web3 = await getWeb3();
    }
    else
    {
        try
        {
            acc = acc.substring(0,5) + "...";
            let chainId = await web3.eth.getChainId();
            if(chainId != 97)
            {
                openModal("Please switch network to Binance Testnet!");
                return;
            }
            $("#metamask-str").html(acc);
            $("#pages-enable").hide();
            $("#pages-shop-enable").hide();
            $("#pages-equip-enable").hide();
            
            await LoadContracts();
            
            let wbalance = await gangContract.methods.balanceOf(ethereum.selectedAddress).call();
            wbalance = web3.utils.fromWei(wbalance, "ether");
            wbalance = parseFloat(wbalance).toFixed(2);

            $("#wbalance").html(wbalance + " $GANG");

            await changeScene("scene_season_apply");
        }
        catch(e)
        {
            console.log(e);
            await sleep(10000);
            //window.close();
        }
    }
}

async function RequestClaim()
{
    openModal("Waiting Confirmations.");
    let tx = await coreInGameContract.methods.claim().send({
        from: ethereum.selectedAddress
    });
    await closeModalTime(3000);
}

async function changeScene(scene)
{
    $("#scene_season_apply").hide();
    $("#scene_game").hide();

    if(scene == "scene_season_apply")
    {
        await loadSeasonScene();
        $("#scene_season_apply").show();
    }
    else if(scene == "scene_game") $("#scene_game").show();
    else
    {
        $("#scene_season_apply").show();
        CurrentScene = "scene_season_apply";
    
    }
    CurrentScene = scene;
}

async function changeSubScene(sub)
{
    if(CurrentScene != "scene_game") return;
    CurrentSubScene = "box-game-submenu-journal";
    $("#box-game-submenu-journal").hide();
    $("#box-game-submenu-ranking").hide();
    $("#box-game-submenu-smackdown").hide();
    $("#box-game-submenu-robbery").hide();
    $("#box-game-submenu-shop").hide();
    $("#box-game-submenu-blackmarket").hide();
    $("#box-game-submenu-factory").hide();
    $("#box-game-submenu-equipment").hide();
    $("#box-game-submenu-hospital").hide();
    $("#box-game-submenu-prison").hide();

    if(sub == "box-game-submenu-journal") $("#box-game-submenu-journal").show();
    else if(sub == "box-game-submenu-ranking") 
    {
        openModal("Loading");
        await LoadRanking();
        $("#box-game-submenu-ranking").show();
        closeModal();
    }
    else if(sub == "box-game-submenu-smackdown") 
    {
        openModal("Loading");
        await LoadSmackdown();
        $("#box-game-submenu-smackdown").show();
        closeModal();
    }
    else if(sub == "box-game-submenu-robbery") 
    {
        openModal("Loading");
        await LoadRobbery();
        $("#box-game-submenu-robbery").show();
        closeModal();
    }
    else if(sub == "box-game-submenu-shop") 
    {
        await LoadShopping(1);
        $("#box-game-submenu-shop").show();
    }
    else if(sub == "box-game-submenu-equipment") 
    {
        await LoadEquipment(1);
        $("#box-game-submenu-equipment").show();
    }
    else if(sub == "box-game-submenu-blackmarket") 
    {
        await LoadBlackMarket();
        $("#box-game-submenu-blackmarket").show();
    }
    else if(sub == "box-game-submenu-factory") 
    {
        openModal("Loading");
        await LoadFactory();
        $("#box-game-submenu-factory").show();
        closeModal();
    }
    else if(sub == "box-game-submenu-hospital") $("#box-game-submenu-hospital").show();
    else if(sub == "box-game-submenu-prison") $("#box-game-submenu-prison").show();
    else $("#box-game-submenu-journal").show();
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }


ethereum.on('accountsChanged', (accounts) => {
    window.location.reload();
    // Handle the new accounts, or lack thereof.
    // "accounts" will always be an array, but it can be empty.
});
  
ethereum.on('chainChanged', async (chainId) => {
    if(chainId != 97)
    {
        $("#metamask-str").html("Switch");
        openModal("Please switch network to Binance Testnet");
        await closeModalTime(3000);
    }
    // Handle the new chain.
    // Correctly handling chain changes can be complicated.
    // We recommend reloading the page unless you have good reason not to.
    window.location.reload();
});

$("#metamask-btn").click(async () => {
    if(!window.web3)
    {
        window.web3 = await getWeb3();
    }
})

$("#apply-char-btn").click(async () => {
    let selectedCharacter = document.getElementById("filter-apply").value;
    if(selectedCharacter <= 0) return;
    openModal("Waiting Confirmations.");
    try{
        await coreingameContract.methods.applyCharacterinSeason(selectedCharacter).send({from:ethereum.selectedAddress});
    }
    catch(e)
    {
        changeModalText(e.message);
        await closeModalTime(2000);
        return;
    }
    changeModalText("Successful Apply.");
    closeModal();
    window.location.reload();
})

$("#mintItem-btn").click(async () => {
    if(Config.selectedItemToMint < 0 || Config.selectedItemToMint >= 10) return;
    closeModalMint();
    openModal("Waiting Confirmations.");
    let appr = "100000000000000000000000";
    let allw = await gangContract.methods.allowance(ethereum.selectedAddress, Config.core).call({from:ethereum.selectedAddress});
    let contractValue = "50000000000000";
    if(allw < "90000000000000000000000")
    {
        try
        {
            changeModalText("Waiting Approval.");
            let Approval = await gangContract.methods.approve(Config.core, appr).send({from: ethereum.selectedAddress});
            changeModalText("Waiting Confirmations.")
            await coreContract.methods.mintGameItem(Config.selectedItemToMint).send({from:ethereum.selectedAddress, value: contractValue});
        }
        catch(e)
        {
            console.log(e);
            changeModalText(e.message);
            await closeModalTime(2000);
            return;
        }
    }
    else
    {
        try{
            await coreContract.methods.mintGameItem(Config.selectedItemToMint).send({from:ethereum.selectedAddress, value: contractValue});
        }
        catch(e)
        {
            console.log(e);
            changeModalText(e.message);
            await closeModalTime(2000);
            return;
        }
    }
    changeModalText("Successful Apply.");
    closeModal();
    await reloadSceneGame("equipment");
})

$("#mintFactory-btn").click(async () => {
    if(Config.selectedItemToMint < 0 || Config.selectedItemToMint >= 10) return;
    closeModalMintF();
    openModal("Waiting Confirmations.");
    let appr = "100000000000000000000000";
    let allw = await gangContract.methods.allowance(ethereum.selectedAddress, Config.core).call({from:ethereum.selectedAddress});
    let contractValue = "50000000000000";
    if(allw < "90000000000000000000000")
    {
        try
        {
            changeModalText("Waiting Approval.");
            let Approval = await gangContract.methods.approve(Config.core, appr).send({from: ethereum.selectedAddress});
            changeModalText("Waiting Confirmation");
            await coreContract.methods.mintFactory().send({from:ethereum.selectedAddress, value: contractValue});
        }
        catch(e)
        {
            changeModalText(e.message);
            await closeModalTime(2000);
            return;
        }
    }
    else
    {
        try{
            await coreContract.methods.mintFactory().send({from:ethereum.selectedAddress, value: contractValue});
        }
        catch(e)
        {
            changeModalText(e.message);
            await closeModalTime(2000);
            return;
        }
    }
    changeModalText("Successful Apply.");
    closeModal();
    reloadSceneGame("factory");
})

$("#mintItemInGame-btn").click(async () => {
    if(Config.selectedItemToMint < 0 || Config.selectedItemToMint >= 10) return;
    openModal("Waiting Confirmations.");
    let appr = "100000000000000000000000";
    let allw = await gangContract.methods.allowance(ethereum.selectedAddress, Config.coreingame).call({from:ethereum.selectedAddress});
    let contractValue = "50000000000000";
    if(allw < "90000000000000000000000")
    {
        try
        {
            changeModalText("Waiting Approval.");
            let Approval = await gangContract.methods.approve(Config.coreingame, appr).send({from: ethereum.selectedAddress});
            changeModalText("Waiting Confirmation");
            await coreingameContract.methods.mintGameItem(Config.selectedItemToMint).send({from:ethereum.selectedAddress, value: contractValue});
        }
        catch(e)
        {
            changeModalText(e.message);
            await closeModalTime(2000);
            return;
        }
    }
    else
    {
        try{
            await coreingameContract.methods.mintGameItem(Config.selectedItemToMint).send({from:ethereum.selectedAddress, value: contractValue});
        }
        catch(e)
        {
            changeModalText(e.message);
            await closeModalTime(2000);
            return;
        }
    }
    changeModalText("Successful Apply.");
    closeModal();
    reloadSceneGame("equipment");
})

$("#begin-treataddiction").click(async () => {
    let ingame = await coreingameContract.methods.getIngameAccount(ethereum.selectedAddress).call();
    let price = await utilsContract.methods.getMintPrice().call();
    let balance = web3.utils.fromWei(ingame.balance, "ether");
    balance = parseFloat(balance).toFixed(2);
    price = web3.utils.fromWei(price, "ether");
    price = parseFloat(price).toFixed(2);
    price /= 40;

    if(price > balance)
    {
        openModal("Inssuficient In-Game Balance | Total: " + price + " $GANG.");
        await closeModalTime(2000);
        return;
    }
    else
    {
        try{
            openModal("Waiting Confirmations | Total: " + price + " $GANG.");
            await hospitalprisonContract.methods.treatAddict(Config.selectedCharacter).send({from:ethereum.selectedAddress});
        }
        catch(e)
        {
            changeModalText(e.message);
            await closeModalTime(2000);
            return;
        }
    }

    changeModalText("Successful Treat Addicition Apply.");
    closeModal();
    reloadSceneGame("hospital");
})

$("#begin-bulletproof").click(async () => {
    let ingame = await coreingameContract.methods.getIngameAccount(ethereum.selectedAddress).call();
    let price = await hospitalprisonContract.methods.getColetePrice(Config.selectedCharacter).call();
    let balance = web3.utils.fromWei(ingame.balance, "ether");
    balance = parseFloat(balance).toFixed(2);
    price = web3.utils.fromWei(price, "ether");
    price = parseFloat(price).toFixed(2);

    if(price > balance)
    {
        openModal("Inssuficient In-Game Balance | Total: " + price + " $GANG.");
        await closeModalTime(2000);
        return;
    }
    else
    {
        try{
            openModal("Waiting Confirmations | Total: " + price + " $GANG.");
            await hospitalprisonContract.methods.activeBulletProof(Config.selectedCharacter).send({from:ethereum.selectedAddress});
        }
        catch(e)
        {
            changeModalText(e.message);
            await closeModalTime(2000);
            return;
        }
    }

    changeModalText("Successful Bullet Proof Apply.");
    closeModal();
    reloadSceneGame("hospital");
})

$("#begin-prison").click(async () => {
    
    let ingame = await coreingameContract.methods.getIngameAccount(ethereum.selectedAddress).call();
    let char = await characterContract.methods.getCharacter(Config.selectedCharacter).call();
    let price = char.prisonPrice;
    let balance = web3.utils.fromWei(ingame.balance, "ether");
    balance = parseFloat(balance).toFixed(2);
    price = web3.utils.fromWei(price, "ether");
    price = parseFloat(price).toFixed(2);

    if(char.prisonTime == "0")
    {
        openModal("You are not in the prison.");
        await closeModalTime(2000);
        return;
    }

    if(price > balance)
    {
        openModal("Inssuficient In-Game Balance | Total: " + price + " $GANG.");
        await closeModalTime(2000);
        return;
    }
    else
    {
        try{
            openModal("Waiting Confirmations | Total: " + price + " $GANG.");
            await hospitalprisonContract.methods.withdrawPrison(Config.selectedCharacter).send({from:ethereum.selectedAddress});
        }
        catch(e)
        {
            changeModalText(e.message);
            await closeModalTime(2000);
            return;
        }
    }

    changeModalText("Successful Treatment.");
    closeModal();
    reloadSceneGame("hospital");
})

$("#begin-hospital").click(async () => {
    
    let ingame = await coreingameContract.methods.getIngameAccount(ethereum.selectedAddress).call();
    let char = await characterContract.methods.getCharacter(Config.selectedCharacter).call();
    let price = char.hospitalPrice;
    let balance = web3.utils.fromWei(ingame.balance, "ether");
    balance = parseFloat(balance).toFixed(2);
    price = web3.utils.fromWei(price, "ether");
    price = parseFloat(price).toFixed(2);

    if(char.nurseTime == "0")
    {
        openModal("You are not in the hospital.");
        await closeModalTime(2000);
        return;
    }

    if(price > balance)
    {
        openModal("Inssuficient In-Game Balance | Total: " + price + " $GANG.");
        await closeModalTime(2000);
        return;
    }
    else
    {
        try{
            openModal("Waiting Confirmations | Total: " + price + " $GANG.");
            await hospitalprisonContract.methods.reviveHospital(Config.selectedCharacter).send({from:ethereum.selectedAddress});
        }
        catch(e)
        {
            changeModalText(e.message);
            await closeModalTime(2000);
            return;
        }
    }

    changeModalText("Successful Treatment.");
    closeModal();
    reloadSceneGame("hospital");
})

$("#begin-rob").click(async () => {
    if(Config.selectedRobbery < 0 || Config.selectedRobbery > 19) return;
    const result = await robberyContract.methods.getRobberyList().call();
    let character = await characterContract.methods.getCharacter(Config.selectedCharacter).call();
    let btime = await utilsContract.methods.getBlockChainTime().call();

    if(character.lastExpedition > btime)
    {
        openModal("One per day!");
        await closeModalTime(2000);
        return;
    }

    if(parseInt(character.power) < parseInt(result[Config.selectedRobbery].powerReq))
    {
        openModal("Inssuficient Power!");
        await closeModalTime(2000);
        return;
    }
    try{
        openModal("Waiting Confirmations.");
        await robberyContract.methods.beginRobbery(Config.selectedCharacter, Config.selectedRobbery).send({from:ethereum.selectedAddress});
        let char = await characterContract.methods.getCharacter(Config.selectedCharacter).call();
        if(char.lastExpeditionResult == "100")
        {
            changeModalText("Successful Robbery!");
        }
        else
        {
            changeModalText("Roll: " + char.lastExpeditionRoll + ". You lost this battle.");
        }
        await closeModalTime(8000);
        await reloadSceneGame("robbery");
        return;
    }
    catch(e)
    {
        changeModalText(e.message);
        await closeModalTime(3000);
        return;
    }
})

$("#begin-smackdown").click(async () => {
    if(Config.selectedSmackDown <= 0) return;
    openModal("Waiting Confirmations.");

    let char = await characterContract.methods.getCharacter(Config.selectedCharacter).call();
    let btime = await utilsContract.methods.getBlockChainTime().call();

    if(char.lastPvP > btime)
    {
        openModal("One per day!");
        await closeModalTime(2000);
    }

    try{
        await pvpContract.methods.beginPvP(Config.selectedCharacter, Config.selectedSmackDown).send({from:ethereum.selectedAddress});
        char = await characterContract.methods.getCharacter(Config.selectedCharacter).call();
        if(char.lastPvPResult == "100")
        {
            changeModalText("Successful Smackdown Win!");
        }
        else
        {
            changeModalText("You lost this battle.");
        }
        await closeModalTime(8000);
        await reloadSceneGame("smackdown");
        return;
    }
    catch(e)
    {
        changeModalText(e.message);
        await closeModalTime(3000);
        return;
    }
})

async function loadSeasonScene()
{
    openModal("Loading");
    let Ingame = await coreingameContract.methods.getIngameAccount(ethereum.selectedAddress).call();
    let claimBalance = Ingame.balance;

    let seasonManager = await seasonContract.methods.getSeasonManager().call();

    let charBalance = await characterContract.methods.balanceOf(ethereum.selectedAddress).call();

    let state = "Preparing next Season.";
    if(seasonManager.seasonState == "RUNNING") state = "Running.";
    
    let htmlString = `<select name="rarity" id="filter-apply" class="form-control"></select>`;

    if(charBalance > 0)
    {
        htmlString = `<select name="rarity" id="filter-apply" class="form-control">`;

        let all_characters = await webutilsContract.methods.getAllCharactersForUser(ethereum.selectedAddress).call();
        let struct_characters = await webutilsContract.methods.getAllCharactersByTokenIds(all_characters.length-1, 0, all_characters, ethereum.selectedAddress).call();
        for(let x = 0; x < struct_characters.length; x++)
        {
            if(struct_characters[x].seasonId != 0) continue;
            htmlString += `<option value="${struct_characters[x].tokenId}">${struct_characters[x].name}</option>`;
        }

        htmlString += `</select>`;
    }
    $("#filter-apply-html").html(htmlString);

    htmlString = `<select name="rarity" id="filter-play" class="form-control"></select>`;
    if(Ingame.seasonSlots > 0)
    {

        htmlString = `<select name="rarity" id="filter-play" class="form-control">`;

        let all_characters = await webutilsContract.methods.getAllCharactersBySeasonId(ethereum.selectedAddress, seasonManager.seasonId).call();
        let struct_characters = await webutilsContract.methods.getAllCharactersByTokenIds(all_characters.length-1, 0, all_characters, ethereum.selectedAddress).call();

        for(let x = 0; x < struct_characters.length; x++)
        {
            htmlString += `<option value="${struct_characters[x].tokenId}">${struct_characters[x].name}</option>`;
        }

        htmlString += `</select>`;
    }
    $("#filter-play-html").html(htmlString);

    let daysleft = await seasonContract.methods.getSeasonDaysLeft().call();

    claimBalance = web3.utils.fromWei(claimBalance, "ether");
    
    claimBalance = parseFloat(claimBalance).toFixed(2);

    

    $("#claim-balance").html(claimBalance);
    $("#season_id").html(seasonManager.seasonId);
    $("#season_apply_id").html(seasonManager.seasonId);
    $("#character_balance").html(charBalance);
    $("#character_inseason").html(Ingame.seasonSlots);
    $("#season_apply_chars").html(seasonManager.charactersInSeason);
    $("#season_apply_state").html(state);
    $("#season_apply_days").html(daysleft);
    closeModal();
}

async function renderFac(id, data){
    let produce = "";

    if(data.itemIdProduce == 10) produce = "Beer";
    else if(data.itemIdProduce == 11) produce = "Cannabis";
    else if(data.itemIdProduce == 12) produce = "Opio";
    else produce = "Cocaine";

    let rarity = "";
    if(data.rarity == 1) rarity = "Common";
    else if(data.rarity == 2) rarity = "Uncommon";
    else if(data.rarity == 3) rarity = "Rare";
    else rarity = "Epic";

    let timestr = "";
    let btime = await utilsContract.methods.getBlockChainTime().call();

    if(btime >= data.claimTime)
    {
        timestr = "Can do claim!";
    }
    else
    {
        let diff = data.claimTime - btime;
        diff = diff / 60;
        let minu = parseInt(diff % 60);
        diff = parseInt(diff / 60);
        timestr = diff.toString() + " Hours " + minu.toString() + " Mins.";
    }

    let htmlString =  `<div class="shopElement2" id="nftfac_${id}">
        <img src="./assets/game/Factory/0.png" alt=""/>
        <div class="name">Factory</div>
        <div class="power">Produces: <div class="labelF">${produce}</div></div>
        <div class="str">Claim: <div class="labelF">${timestr}</div></div>
        <div class="int">Quantity Produce: <div class="labelF">${data.quantity} per day.</div></div>
        <div class="cha">Rarity: <div class="labelF">${rarity}</div></div>
        <input type="button" data-nft-id="${id}" class="button-42" value="Claim"/>
    </div>`;

    let element = $.parseHTML(htmlString);
    $("#nft_fac").append(element);

    $(`#nftfac_${id} .button-42`).click(async () => {
        openModal("Waiting Confirmation");
        //sell
        try
        {
            await coreingameContract.methods.claimFactory(id).send({from:ethereum.selectedAddress});
            changeModalText("Successful Claim");
            await closeModalTime(2000);
            await reloadSceneGame("factory");
        }
        catch(e)
        {
            changeModalText(e.message);
            await closeModalTime(2000);
        }
    })
}

async function renderFactory(id){
    let price = await utilsContract.methods.getMintPrice().call();
    price =  web3.utils.fromWei(price, "ether");
    price = parseFloat(price).toFixed(2) * 3;
    let priceStr = price + " $GANG";
    let htmlString =  `<div class="shopElement2" id="nftf_${id}">
        <img src="./assets/game/Factory/0.png" alt=""/>
        <div class="name">Factorys</div>
        <div class="power">Produces: <div class="labelF">Beer, Cannabis, Opio, Cocaine</div></div>
        <div class="price">Price: <div class="labelF">${priceStr}</div></div>
        <div class="str">Claim: <div class="labelF">Every Day (24hours)</div></div>
        <div class="int">Quantity Produce: <div class="labelF">5 ~ 17</div></div>
        <div class="cha">Rarity: <div class="labelF">Common ~ Epic</div></div>
        <input type="button" data-nft-id="${id}" class="button-42" value="Mint"/>
    </div>`;

    let element = $.parseHTML(htmlString);
    $("#nft_shop").append(element);

    $(`#nftf_${id} .button-42`).click(async () => {
        //sell
        let balance = await gangContract.methods.balanceOf(ethereum.selectedAddress).call();
        balance = web3.utils.fromWei(balance, "ether");
        let balanceIn = await coreingameContract.methods.getIngameAccount(ethereum.selectedAddress).call();
        balanceIn = balanceIn.balance;
        balanceIn = web3.utils.fromWei(balanceIn, "ether");
        balanceIn = parseFloat(balanceIn).toFixed(2);
        openModalMintF("Mint Factory:", ("Factory"), ("Total Price: " + parseFloat(price).toFixed(1) + " $GANG"), balance.toString(), balanceIn.toString());
    })
}

async function renderShop(id, data){

    let price =  web3.utils.fromWei(data.price, "ether");
    let priceStr = parseFloat(price).toFixed(1) + " $GANG";
    let htmlString =  `<div class="shopElement" id="nft_${id}">
        <img src="./assets/game/Guns/w_${id-1}.png" alt=""/>
        <div class="name">${data.name}</div>
        <div class="power">Bonus Power: <div class="labelF">${data.powerBonus}</div></div>
        <div class="price">Price: <div class="labelF">${priceStr}</div></div>
        <div class="str">Strength: <div class="labelF">${data.strBonus}</div></div>
        <div class="int">Inteligence: <div class="labelF">${data.intBonus}</div></div>
        <div class="cha">Charisma: <div class="labelF">${data.chaBonus}</div></div>
        <div class="res">Resistance: <div class="labelF">${data.resBonus}</div></div>
        <input type="button" data-nft-id="${id}" class="button-61" value="Mint"/>
    </div>`;

    let element = $.parseHTML(htmlString);
    $("#nft_shop").append(element);

    $(`#nft_${id} .button-61`).click(async () => {
        //sell
        let balance = await gangContract.methods.balanceOf(ethereum.selectedAddress).call();
        balance = web3.utils.fromWei(balance, "ether");
        let balanceIn = await coreingameContract.methods.getIngameAccount(ethereum.selectedAddress).call();
        balanceIn = balanceIn.balance;
        balanceIn = web3.utils.fromWei(balanceIn, "ether");
        balanceIn = parseFloat(balanceIn).toFixed(2);
        Config.selectedItemToMint = id-1;
        openModalMint("Mint Game Item:", ("Weapon: " + data.name), ("Total Price: " + parseFloat(price).toFixed(1) + " $GANG"), balance.toString(), balanceIn.toString());
    })
}

async function renderBlackMarket(length, itemId, acc){

    let itemData = await itemlistContract.methods.getItemListData(itemId).call();
    let hpstr = "";
    let addiction = "";

    let pricestr = await utilsContract.methods.getMintPrice().call();
    pricestr = web3.utils.fromWei(pricestr, "ether");
    
    if(itemId == 10) pricestr = (((pricestr * 3) / 45) / 6);
    else if(itemId == 11) pricestr = (((pricestr * 3) / 35) / 6);
    else if(itemId == 12) pricestr = (((pricestr * 3) / 25) / 6);
    else pricestr = (((pricestr * 3) / 15) / 6);

    pricestr = parseFloat(pricestr).toFixed(5);
    pricestr = pricestr + " $GANG";

    if(itemId == 10) 
    {
        hpstr = "+50";
        addiction = "+10";
    }
    else if(itemId == 11) 
    {
        hpstr = "+100";
        addiction = "+10";
    }
    else if(itemId == 12) 
    {
        hpstr = "+200";
        addiction = "+15";
    }
    else
    {
        hpstr = "+500";
        addiction = "+20";
    }

    let htmlString =  `<div class="shopElement" id="nft_b${itemId}">
        <img src="./assets/game/drugs/${itemId}.png" alt=""/>
        <div class="name">${itemData.name}</div>
        <div class="int2">Quantity: <div class="labelF">${length}</div></div>
        <div class="int3">Price: <div class="labelF">${pricestr}</div></div>
        <div class="gap2">BLACK MARKET</div>
        <div class="nk-form-control-number">
            <input type="number" min="1" max="${length}" id="mintxx-${itemId}" value="1" class="form-control">
        </div>
        <input type="button" data-nft-id="${itemId}" class="button-46" value="Sell items on Black Market"/>
    </div>`;
    

    let element = $.parseHTML(htmlString);
    $("#nft_black").append(element);

    $(`#nft_b${itemId} .button-46`).click(async () => {
        openModal("Waiting Confirmations.");
        let mintx = document.getElementById(`mintxx-${itemId}`).value;
        if(mintx < 1) mintx = 1;
        if(mintx > length)
        {
            changeModalText("Inssuficient Item Balance.");
            await closeModal(2000);
            return;
        }
        try
        {
            await blackmarketContract.methods.sellDrugs(mintx, itemId).send({from:ethereum.selectedAddress});
        }
        catch(e)
        {
            changeModalText(e.message);
            await closeModalTime(2000);
            return;
        }
        changeModalText("Items used successfully.");
        await closeModalTime(2000);
        await reloadSceneGame("equipment");
    })
}

async function renderDrugs(length, itemId, acc){

    let itemData = await itemlistContract.methods.getItemListData(itemId).call();
    let hpstr = "";
    let addiction = "";

    if(itemId == 10) 
    {
        hpstr = "+50";
        addiction = "+10";
    }
    else if(itemId == 11) 
    {
        hpstr = "+100";
        addiction = "+10";
    }
    else if(itemId == 12) 
    {
        hpstr = "+200";
        addiction = "+15";
    }
    else
    {
        hpstr = "+500";
        addiction = "+20";
    }

    let htmlString =  `<div class="shopElement" id="nft_s${itemId}">
        <img src="./assets/game/drugs/${itemId}.png" alt=""/>
        <div class="name">${itemData.name}</div>
        <div class="power2">Health Healing: <div class="labelF">${hpstr}</div></div>
        <div class="str2">Addiction: <div class="labelF">${addiction}</div></div>
        <div class="int2">Quantity: <div class="labelF">${length}</div></div>
        <div class="nk-form-control-number">
            <input type="number" min="1" max="10" id="minty-${itemId}" value="1" class="form-control">
        </div>
        <input type="button" data-nft-id="${itemId}" class="button-45" value="Sell on the Market Place"/>
        <div class="nk-form-control-number">
            <input type="number" min="1" max="10" id="mintx-${itemId}" value="1" class="form-control">
        </div>
        <input type="button" data-nft-id="${itemId}" class="button-41" value="Use Items"/>
    </div>`;
    

    let element = $.parseHTML(htmlString);
    $("#nft_equip").append(element);

    $(`#nft_s${itemId} .button-41`).click(async () => {
        openModal("Waiting Confirmations.");
        let mintx = document.getElementById(`mintx-${itemId}`).value;
        if(mintx < 1 || mintx > 10) mintx = 1;
        if(mintx > length)
        {
            changeModalText("Inssuficient Item Balance.");
            await closeModal(2000);
            return;
        }
        try
        {
            await hospitalprisonContract.methods.useItem(Config.selectedCharacter, itemId, mintx).send({from:ethereum.selectedAddress});
        }
        catch(e)
        {
            changeModalText(e.message);
            await closeModalTime(2000);
            return;
        }
        changeModalText("Items used successfully.");
        await closeModalTime(2000);
        await reloadSceneGame("equipment");
    })
    $(`#nft_s${itemId} .button-45`).click(async () => {
        let mintx = document.getElementById(`minty-${itemId}`).value;
        Config.mintx = mintx;
        Config.selectedItemId = itemId;
        Config.nftType = 3;
        Config.selectedTokenId = 0;
        if(mintx < 1 || mintx > 10) mintx = 1;
        if(mintx > length)
        {
            openModal("Inssuficient Item Balance.");
            await closeModalTime(2000);
            return;
        }
        try
        {
            openModalMarket("Market Place", "Drug: " + itemData.name, "Quantity: " + length);
        }
        catch(e)
        {
            openModal(e.message);
            await closeModalTime(2000);
            return;
        }
    })
}


async function renderEquip(id, data){

    let rarity = "";
    if(data.rarity == 1) rarity = "Common";
    else if(data.rarity == 2) rarity = "Uncommon";
    else if(data.rarity == 3) rarity = "Rare";
    else rarity = "Epic";

    let char = await characterContract.methods.getCharacter(Config.selectedCharacter).call();

    if(data.equiped && char.weaponId != data.tokenId)
    {
        return;
    }

    let ButtomStr = "Equip";
    if(data.equiped) ButtomStr ="Un-Equip";

    let htmlString =  `<div class="shopElement" id="nft_s${id}">
        <img src="./assets/game/Guns/w_${data.itemId}.png" alt=""/>
        <div class="name">${data.name}</div>

        <div class="power">Bonus Power: <div class="labelF">${data.powerBonus}</div></div>
        <div class="price">Rarity: <div class="labelF">${rarity}</div></div>
        <input type="button" data-nft-id="${id}" class="button-41" value="${ButtomStr}"/>
        <div class="str">Strength: <div class="labelF">${data.strBonus}</div></div>
        <div class="int">Inteligence: <div class="labelF">${data.intBonus}</div></div>
        <div class="cha">Charisma: <div class="labelF">${data.chaBonus}</div></div>
        <div class="res">Resistance: <div class="labelF">${data.resBonus}</div></div>
        <input type="button" data-nft-id="${id}" class="button-59" value="Sell"/>
    </div>`;
    

    let element = $.parseHTML(htmlString);
    $("#nft_equip").append(element);

    $(`#nft_s${id} .button-41`).click(async () => {
        openModal("Waiting Confirmations.");
        try
        {
            if(!data.equiped) 
            {
                if(char.weaponId != 0)
                {
                    changeModalText("You have weapon equiped!");
                    await closeModalTime(2000);
                    return;
                }
                await equipmentContract.methods.equipWeapon(Config.selectedCharacter, id).send({from:ethereum.selectedAddress});
            }
            else 
            {
                let btime = await utilsContract.methods.getBlockChainTime().call();
                if(data.equipedTime > btime)
                {
                    let diff = data.equipedTime - btime;
                    diff = diff / 60;
                    let minu = parseInt(diff % 60);
                    diff = parseInt(diff / 60);
                    
                    timestr = diff.toString() + " Hours " + minu.toString() + " Mins.";
                    changeModalText("Time to Un-Equip: " + timestr);
                    await closeModalTime(2000);
                    return;
                }

                await equipmentContract.methods.unequipWeapon(Config.selectedCharacter).send({from:ethereum.selectedAddress});
            }
        }
        catch(e)
        {
            changeModalText(e.message);
            await closeModalTime(2000);
            return;
        }
        changeModalText("Successful Weapon Equiped!");
        await closeModalTime(2000);
        await reloadSceneGame("equipment");
    })

    $(`#nft_s${id} .button-59`).click(async () => {
        Config.mintx = 0;
        Config.selectedItemId = data.itemId;
        Config.nftType = 2;
        Config.selectedTokenId = data.tokenId;
        try
        {
            openModalMarket("Market Place", "Drug: " + data.name, "Quantity: " + length);
        }
        catch(e)
        {
            openModal(e.message);
            await closeModalTime(2000);
            return;
        }
    })
}

function openModalMint(title, text, text2, balance, ingame)
{
    $("#modal-mint-title").html(title);
    $("#modal-mint-text").html(text);
    $("#modal-mint-text2").html(text2);
    $("#modal-mint-balance").html("MetaMask Balance: " + balance + " $GANG");
    $("#modal-mint-ingame").html("In-Game Balance: " + balanceIn + " $GANG");
    $("#modal-mint").modal({
        keyboard: false, //remove option to close with keyboard
        show: true //Display loader!
      });
    $("#modal-mint").modal("show");
}

async function renderNFT(id, data){
    let rarity = "";
    if(data.rarity == 1) rarity = "Common";
    else if(data.rarity == 2) rarity = "Uncommon";
    else if(data.rarity == 3) rarity = "Rare";
    else rarity = "Epic";

    let htmlString =  `<div class="rankingBox">
        <div class="rankingSlot">${id}</div>
        <div class="rankingName">${data.name}</div>
        <div class="rankingRarity" id="rankingRarity">${rarity}</div>
        <div class="rankingPower" id="rankingPower">${data.power}</div>
        <div class="rankingRespect" id="rankingRespect">${data.respect}</div>
    </div>`;

    let element = $.parseHTML(htmlString);
    $("#nft_row").append(element);
}

async function Load(max, min, data) {
    if(data.length > 0)
    {
        for(let x = min; x <= max; x++)
        {
            let _data = data[x];
            await renderNFT(x+1, _data);
        }
    }
}

async function LoadShop(max, min, data) {
    if(data.length > 0)
    {
        for(let x = min; x <= max; x++)
        {
            let _data = data[x];
            await renderShop(x+1, _data);
        }
    }
}

async function LoadEquip(max, min, data) {
    if(data.length > 0)
    {
        for(let x = min; x <= max; x++)
        {
            let _data = data[x];
            if(_data.itemId >= 0 && _data.itemId < 10) await renderEquip(_data.tokenId, _data);
        }
    }
}

async function LoadDrugs(length, itemId, data) {
    await renderDrugs(length, itemId, data);
}

async function LoadFac(max, min, data) {
    if(data.length > 0)
    {
        for(let x = min; x <= max; x++)
        {
            let _data = data[x];
            await renderFac(_data.tokenId, _data);
        }
    }
}

async function createPages(length)
{
    $("#pages-enable").hide();
    $("#pages").html("");

    let htmlString = ``;
    if(length > 9)
    {
        $("#pages-enable").show();
        Config.pages = parseInt(length / 20);
        if(length % 20 > 0) Config.pages++;
        for(let x = 0; x < Config.pages; x++)
        {
            if(x == 0) htmlString = `<a href="#" id="btn-pg-1" onclick="changePage(1);">1</a>`;
            
            else htmlString = `<a href="#" id="btn-pg-${x+1}" onclick="changePage(${x+1});">${x+1}</a>`;
            $("#pages").append(htmlString);
        }
    }
    else
    {
        Config.pages = 1;
    }
}

async function createShopPages(length)
{
    $("#pages-shop-enable").hide();
    $("#pages-shop").html("");

    let htmlString = ``;
    if(length > 9)
    {
        $("#pages-shop-enable").show();
        Config.pages_shop = parseInt(length / 5);
        if(length % 5 > 0) Config.pages_shop++;
        for(let x = 0; x < Config.pages_shop; x++)
        {
            if(x == 0) htmlString = `<a href="#" id="btn-pgs-1" onclick="changeShopPage(1);">1</a>`;
            
            else htmlString = `<a href="#" id="btn-pgs-${x+1}" onclick="changeShopPage(${x+1});">${x+1}</a>`;
            $("#pages-shop").append(htmlString);
        }
    }
    else
    {
        Config.pages_shop = 1;
    }
}

async function createFactoryPages(length)
{
    $("#pages-fac-enable").hide();
    $("#pages-fac").html("");

    let htmlString = ``;
    if(length > 3)
    {
        $("#pages-fac-enable").show();
        Config.pages_fac = parseInt(length / 3);
        if(length % 3 > 0) Config.pages_fac++;
        for(let x = 0; x < Config.pages_fac; x++)
        {
            if(x == 0) htmlString = `<a href="#" id="btn-pgf-1" onclick="changeFactoryPage(1);">1</a>`;
            
            else htmlString = `<a href="#" id="btn-pgf-${x+1}" onclick="changeFactoryPage(${x+1});">${x+1}</a>`;
            $("#pages-fac").append(htmlString);
        }
    }
    else
    {
        Config.pages_fac = 1;
    }
}

async function createEquipPages(length)
{
    $("#pages-equip-enable").hide();
    $("#pages-equip").html("");

    let htmlString = ``;
    if(length > 5)
    {
        $("#pages-equip-enable").show();
        Config.pages_equip = parseInt(length / 5);
        if(length % 5 > 0) Config.pages_equip++;
        for(let x = 0; x < Config.pages_equip; x++)
        {
            if(x == 0) htmlString = `<a href="#" id="btn-pge-1" onclick="changeEquipPage(1);">1</a>`;
            
            else htmlString = `<a href="#" id="btn-pge-${x+1}" onclick="changeEquipPage(${x+1});">${x+1}</a>`;
            $("#pages-equip").append(htmlString);
        }
    }
}

async function changeFactoryPage(id)
{
    if(!$('#btn-pgf-' + id).hasClass('nk-pagination-current-white'))
    {
        $('#btn-pgf-' + id).addClass('nk-pagination-current-white');
        for(let x = 1; x <= Config.pages_fac; x++)
        {
            if(x != id)
            {
                if ($('#btn-pgf-' + x).hasClass('nk-pagination-current-white'))
                {
                    $('#btn-pgf-' + x).removeClass('nk-pagination-current-white');
                }
            }
        }
    }
    else
    {
        if(id != 1)
        {
            if ($('#btn-pgf-' + id).hasClass('nk-pagination-current-white'))
            {
                $('#btn-pgf-' + id).removeClass('nk-pagination-current-white');
                for(let x = 1; x <= Config.pages_fac; x++)
                {
                    if(x != id)
                    {
                        if ($('#btn-pgf-' + x).hasClass('nk-pagination-current-white'))
                        {
                            $('#btn-pgf-' + x).removeClass('nk-pagination-current-white');
                        }
                    }
                }
                if (!$('#btn-pgf-1').hasClass('nk-pagination-current-white'))
                {
                    $('#btn-pgf-1').addClass('nk-pagination-current-white');
                }
            }
        }
    }
    openModal("Loading...");
    Config.pageId_fac = id;
    let fac = await factoryContract.methods.getAllFactorysForUser(ethereum.selectedAddress).call();
    let facData = await factoryContract.methods.getAllFactorysByTokenIds(fac.length-1, 0, fac).call();

    let filterNfts = facData;

    $("#nft_fac").html("");

    let max = parseInt(Config.pageId_fac * 3);
    let rest = parseInt(filterNfts.length % 3);
    
    let min = 0;
    if(Config.pageId_fac > 1 && Config.pageId_fac < Config.pages_fac)
    {
        min = parseInt((Config.pageId_fac - 1) * 3);
        await LoadFac((max - 1), min, filterNfts);
    }
    else if(Config.pageId_fac == Config.pages_fac)
    {   
        min = parseInt((Config.pageId_fac - 1) * 3);
        if(rest != 0) max = parseInt(((Config.pageId_fac - 1) * 3) + rest);
        await LoadFac((max - 1), min, filterNfts);
    }
    else if(Config.pageId_fac == 1)
    {
        await LoadFac((max - 1), min, filterNfts);
    }
    closeModal();
    await closeModalTime(1000);
}

async function changeEquipPage(id)
{
    if(!$('#btn-pge-' + id).hasClass('nk-pagination-current-white'))
    {
        $('#btn-pge-' + id).addClass('nk-pagination-current-white');
        for(let x = 1; x <= Config.pages_shop; x++)
        {
            if(x != id)
            {
                if ($('#btn-pge-' + x).hasClass('nk-pagination-current-white'))
                {
                    $('#btn-pge-' + x).removeClass('nk-pagination-current-white');
                }
            }
        }
    }
    else
    {
        if(id != 1)
        {
            if ($('#btn-pge-' + id).hasClass('nk-pagination-current-white'))
            {
                $('#btn-pge-' + id).removeClass('nk-pagination-current-white');
                for(let x = 1; x <= Config.pages_shop; x++)
                {
                    if(x != id)
                    {
                        if ($('#btn-pge-' + x).hasClass('nk-pagination-current-white'))
                        {
                            $('#btn-pge-' + x).removeClass('nk-pagination-current-white');
                        }
                    }
                }
                if (!$('#btn-pge-1').hasClass('nk-pagination-current-white'))
                {
                    $('#btn-pge-1').addClass('nk-pagination-current-white');
                }
            }
        }
    }
    openModal("Loading...");
    Config.pageId_equip = id;
    
    let GameItems = await webutilsContract.methods.getAllItemsForUser(ethereum.selectedAddress).call();
    let GameItemsData = await webutilsContract.methods.getAllItemsByTokenIds(GameItems).call();

    let filterNfts = GameItemsData;

    $("#nft_equip").html("");

    let max = parseInt(Config.pageId_equip * 5);
    let rest = parseInt(filterNfts.length % 5);
        
    let min = 0;
    if(Config.pageId_equip > 1 && Config.pageId_equip < Config.pages_equip)
    {
        min = parseInt((Config.pageId_equip - 1) * 5);
        await LoadEquip((max - 1), min, filterNfts);
    }
    else if(Config.pageId_equip == Config.pages_equip)
    {   
        min = parseInt((Config.pageId_equip - 1) * 5);
        if(rest != 0) max = parseInt(((Config.pageId_equip - 1) * 5) + rest);
        await LoadEquip((max - 1), min, filterNfts);
    }
    else if(Config.pageId_equip == 1)
    {
        await LoadEquip((max - 1), min, filterNfts);
    }
    
    closeModal();
    await closeModalTime(1000);
}

async function changePage(id)
{
    if(!$('#btn-pg-' + id).hasClass('nk-pagination-current-white'))
    {
        $('#btn-pg-' + id).addClass('nk-pagination-current-white');
        for(let x = 1; x <= Config.pages; x++)
        {
            if(x != id)
            {
                if ($('#btn-pg-' + x).hasClass('nk-pagination-current-white'))
                {
                    $('#btn-pg-' + x).removeClass('nk-pagination-current-white');
                }
            }
        }
    }
    else
    {
        if(id != 1)
        {
            if ($('#btn-pg-' + id).hasClass('nk-pagination-current-white'))
            {
                $('#btn-pg-' + id).removeClass('nk-pagination-current-white');
                for(let x = 1; x <= Config.pages; x++)
                {
                    if(x != id)
                    {
                        if ($('#btn-pg-' + x).hasClass('nk-pagination-current-white'))
                        {
                            $('#btn-pg-' + x).removeClass('nk-pagination-current-white');
                        }
                    }
                }
                if (!$('#btn-pg-1').hasClass('nk-pagination-current-white'))
                {
                    $('#btn-pg-1').addClass('nk-pagination-current-white');
                }
            }
        }
    }
    openModal("Loading...");
    Config.pageId = id;
    let seasonManager = await seasonContract.methods.getSeasonManager().call();
    var all_tokenIds = await rankingContract.methods.getAllCharactersInSeason(seasonManager.seasonId).call();

    if(all_tokenIds == undefined || all_tokenIds == null) return;

    var filterNfts = await rankingContract.methods.getAllCharactersByTokenIds(all_tokenIds).call();

    if(filterNfts == undefined || filterNfts == null) return;

    var sort = [];
    for(let x = 0; x < filterNfts.length; x++)
    {
        sort[x] = filterNfts[x];
    }

    filterNfts = sort.sort(compararNumeros);

    $("#nft_row").html("");

    let max = parseInt(Config.pageId * 20);
    let rest = parseInt(filterNfts.length % 20);
    
    let min = 0;
    if(Config.pageId > 1 && Config.pageId < Config.pages)
    {
        min = parseInt((Config.pageId - 1) * 20);
        await Load((max - 1), min, filterNfts);
    }
    else if(Config.pageId == Config.pages)
    {
        min = parseInt((Config.pageId - 1) * 20);
        if(rest != 0) max = parseInt(((Config.pageId - 1) * 20) + rest);
        await Load((max - 1), min, filterNfts);
    }
    else if(Config.pageId == 1)
    {
        await Load((max - 1), min, filterNfts);
    }
    closeModal();
    await closeModalTime(1000);
}

async function changeShopPage(id)
{
    if(!$('#btn-pgs-' + id).hasClass('nk-pagination-current-white'))
    {
        $('#btn-pgs-' + id).addClass('nk-pagination-current-white');
        for(let x = 1; x <= Config.pages_shop; x++)
        {
            if(x != id)
            {
                if ($('#btn-pgs-' + x).hasClass('nk-pagination-current-white'))
                {
                    $('#btn-pgs-' + x).removeClass('nk-pagination-current-white');
                }
            }
        }
    }
    else
    {
        if(id != 1)
        {
            if ($('#btn-pgs-' + id).hasClass('nk-pagination-current-white'))
            {
                $('#btn-pgs-' + id).removeClass('nk-pagination-current-white');
                for(let x = 1; x <= Config.pages_shop; x++)
                {
                    if(x != id)
                    {
                        if ($('#btn-pgs-' + x).hasClass('nk-pagination-current-white'))
                        {
                            $('#btn-pgs-' + x).removeClass('nk-pagination-current-white');
                        }
                    }
                }
                if (!$('#btn-pgs-1').hasClass('nk-pagination-current-white'))
                {
                    $('#btn-pgs-1').addClass('nk-pagination-current-white');
                }
            }
        }
    }
    openModal("Loading...");
    Config.pageId_shop = id;
    let shopList = await itemlistContract.methods.getWeaponList().call();

    var ItemData = await itemlistContract.methods.getAllItemDataByTokenIds(shopList).call();

    let filterNfts = ItemData;

    $("#nft_shop").html("");
    
    let max = parseInt(Config.pageId_shop * 5);
    let rest = parseInt(filterNfts.length % 5);
    
    let min = 0;
    if(Config.pageId_shop > 1 && Config.pageId_shop < Config.pages_shop)
    {
        min = parseInt((Config.pageId_shop - 1) * 5);
        await LoadShop((max - 1), min, filterNfts);
    }
    else if(Config.pageId_shop == Config.pages_shop)
    {   
        min = parseInt((Config.pageId_shop - 1) * 5);
        if(rest != 0) max = parseInt(((Config.pageId_shop - 1) * 5) + rest);
        await LoadShop((max - 1), min, filterNfts);
    }
    else if(Config.pageId_shop == 1)
    {
        await LoadShop((max - 1), min, filterNfts);
    }
    await closeModalTime(300);
}

function compararNumeros(a, b) {
    return b.respect - a.respect;
}

async function LoadFactory()
{
    if(Config.selectedCharacter == null || Config.selectedCharacter == undefined || Config.selectedCharacter == 0)
    {
        return;
    }

    let fac = await factoryContract.methods.getAllFactorysForUser(ethereum.selectedAddress).call();
    let facData = await factoryContract.methods.getAllFactorysByTokenIds(fac.length-1, 0, fac).call();

    $("#nft_fac").html("");

    await createFactoryPages(facData.length);
    if(Config.pages_fac > 1) await changeFactoryPage(1);
    else
    {
        if(facData.length > 0 && facData[0] != 0) await LoadFac((facData.length - 1), 0, facData);
    }
    await closeModalTime(1000);
}

async function LoadBlackMarket()
{
    openModal("Loading");
    if(Config.selectedCharacter == null || Config.selectedCharacter == undefined || Config.selectedCharacter == 0)
    {
        return;
    }

    $("#nft_black").html("");
   
    let acc = await coreingameContract.methods.getIngameAccount(ethereum.selectedAddress).call();
    await renderBlackMarket(acc.beer, 10, acc);
    await renderBlackMarket(acc.cannabis, 11, acc);
    await renderBlackMarket(acc.opio, 12, acc);
    await renderBlackMarket(acc.cocaine, 13, acc);
    await closeModalTime(100);
    closeModal();
}

async function LoadEquipment(tab)
{
    openModal("Loading");
    if(Config.selectedCharacter == null || Config.selectedCharacter == undefined || Config.selectedCharacter == 0)
    {
        return;
    }

    $("#nft_equip").html("");

    if(tab ==  1)
    {
        let GameItems = await webutilsContract.methods.getAllItemsForUser(ethereum.selectedAddress).call();
        let GameItemsData = await webutilsContract.methods.getAllItemsByTokenIds(GameItems).call();
        await createEquipPages(GameItemsData.length);
        if(Config.pages_equip > 1) await changeEquipPage(1);
        else
        {
            if(GameItemsData.length > 0 && GameItemsData[0] != 0) 
            {
                await LoadEquip((GameItemsData.length - 1), 0, GameItemsData);
            }
        }
    }
    else
    {   
        let acc = await coreingameContract.methods.getIngameAccount(ethereum.selectedAddress).call();
        await LoadDrugs(acc.beer, 10, acc);
        await LoadDrugs(acc.cannabis, 11, acc);
        await LoadDrugs(acc.opio, 12, acc);
        await LoadDrugs(acc.cocaine, 13, acc);
    }
    await closeModalTime(100);
    closeModal();
}

async function LoadShopping(shopTab)
{
    if(Config.selectedCharacter == null || Config.selectedCharacter == undefined || Config.selectedCharacter == 0)
    {
        return;
    }
    if(shopTab == 1)
    {
        let shopList = await itemlistContract.methods.getWeaponList().call();

        var ItemData = await itemlistContract.methods.getAllItemDataByTokenIds(shopList).call();
        $("#nft_shop").html("");

        await createShopPages(ItemData.length);
        if(Config.pages_shop > 1) await changeShopPage(1);
        else
        {
            if(ItemData.length > 0 && ItemData[0] != 0) await LoadShop((ItemData.length - 1), 0, ItemData);
        }
        await closeModalTime(1000);
    }
    else
    {
        openModal("Loading");
        $("#pages-shop-enable").hide();
        $("#pages-shop").html("");
        $("#nft_shop").html("");
        await renderFactory(1);
        await closeModalTime(1000);
    } 
}

async function LoadRanking()
{
    if(Config.selectedCharacter == null || Config.selectedCharacter == undefined || Config.selectedCharacter == 0)
    {
        return;
    }
    
    let seasonManager = await seasonContract.methods.getSeasonManager().call();
    var all_tokenIds = await rankingContract.methods.getAllCharactersInSeason(seasonManager.seasonId).call();

    if(all_tokenIds == undefined || all_tokenIds == null) return;

    var all_characters = await rankingContract.methods.getAllCharactersByTokenIds(all_tokenIds).call();

    if(all_characters == undefined || all_characters == null) return;

    $("#nft_row").html("");

    var sort = [];
    var sorted = [];
    for(let x = 0; x < all_characters.length; x++)
    {
        sort[x] = all_characters[x];
    }

    all_characters = sort.sort(compararNumeros);

    await createPages(all_tokenIds.length);
    if(Config.pages > 1) await changePage(1);
    else
    {
        if(all_characters.length > 0 && all_characters[0] != 0) await Load((all_characters.length - 1), 0, all_characters);
    }
    await closeModalTime(1000);
}

async function LoadRobbery()
{
    if(Config.selectedCharacter == null || Config.selectedCharacter == undefined || Config.selectedCharacter == 0)
    {
        return;
    }
    
    const result = await robberyContract.methods.getRobberyList().call();
    if(result == undefined || result == null && result.length != 20) return;

    let htmlString = `<select name="robbery" id="filter-robbery-enemys" class="form-control">`;
    for(let x = 0; x < result.length; x++)
    {
        htmlString += `<option value="${x}">${result[x].name}</option>`;
    }

    htmlString += `</select>`;
    $("#filter-robbery-list").html(htmlString);

    Config.selectedRobbery = 0;    
    await loadRobberyEnemyData(result[0]);

    document.getElementById("filter-robbery-enemys").addEventListener('change', async function() {
        openModal("Loading");
        let robberySelected = document.getElementById("filter-robbery-enemys").value;
        const robbery = await robberyContract.methods.getRobberyList().call();
        Config.selectedRobbery = robberySelected;
        await loadRobberyEnemyData(robbery[Config.selectedRobbery]);
        closeModal();
    });
}

async function LoadSmackdown()
{
    if(Config.selectedCharacter == null || Config.selectedCharacter == undefined || Config.selectedCharacter == 0)
    {
        return;
    }
    
    let seasonManager = await seasonContract.methods.getSeasonManager().call();
    let acc = ethereum.selectedAddress;
    acc = acc.toString().toLowerCase();
    let smackdown = await rankingContract.methods.getSmackDownByCharacter(Config.selectedCharacter, seasonManager.seasonId).call();
    const result = await rankingContract.methods.getAllCharactersByTokenIds(smackdown).call();
    if(result == undefined || result == null || result.length == 0) return;
    let htmlString = `<select name="smackdown" id="filter-smackdown-enemys" class="form-control">`;
    for(let x = 0; x < result.length; x++)
    {
        if(result[x].owner.toLowerCase() != acc)
            htmlString += `<option value="${result[x].tokenId}">${result[x].name}</option>`;
    }

    htmlString += `</select>`;
    $("#filter-smackdown-list").html(htmlString);

    Config.selectedSmackDown = result[0].tokenId;    
    await loadSmackDownEnemyData(result[0]);

    document.getElementById("filter-smackdown-enemys").addEventListener('change', async function() {
        openModal("Loading");
        let enemySelected = document.getElementById("filter-smackdown-enemys").value;
        let enemy_data = await characterContract.methods.getCharacter(enemySelected).call();
        Config.selectedSmackDown = enemySelected;
        await loadSmackDownEnemyData(enemy_data);
        closeModal();
    });
}

async function loadRobberyEnemyData(enemy)
{
    let statStr = "";
    if(enemy.bestStats == 1) statStr = "Strength";
    else if(enemy.bestStats == 2) statStr = "Inteligence";
    else if(enemy.bestStats == 3) statStr = "Charisma";
    else statStr = "Resistence";

    let totalChance = await robberyContract.methods.getChanceForRobbery(Config.selectedCharacter, Config.selectedRobbery).call({from:ethereum.selectedAddress});
    let char = await characterContract.methods.getCharacter(Config.selectedCharacter).call();
    let prisonChance = await utilsContract.methods.getBasePrisonChance(char.rarity, char.vicio).call();
    let btime = await utilsContract.methods.getBlockChainTime().call();

    let timestr = "";

    if(btime >= char.lastExpedition)
    {
        timestr = "Can do Robbery!";
    }
    else
    {
        let diff = char.lastExpedition - btime;
        diff = diff / 60;
        let minu = parseInt(diff % 60);
        diff = parseInt(diff / 60);
        
        timestr = diff.toString() + " Hours " + minu.toString() + " Mins.";
    }

    let RewardStr = web3.utils.fromWei(enemy.reward, "ether");
    RewardStr = parseFloat(RewardStr).toFixed(2);
    RewardStr = RewardStr + " $GANG";

    $("#robbery-enemy-countdown").html(timestr);
    $("#robbery-enemy-name").html(enemy.name);
    $("#robbery-enemy-reqpower").html(enemy.powerReq);
    $("#robbery-enemy-basechance").html("Chance: " + enemy.baseChance + "%");
    $("#robbery-enemy-beststats").html(statStr);
    $("#robbery-enemy-totalchance").html("Chance: " + totalChance + "%");
    $("#robbery-enemy-respect").html(enemy.respectReward);
    $("#robbery-enemy-reward").html(RewardStr);
    $("#robbery-enemy-dmg").html(enemy.baseDamage);

    $("#robbery-enemy-prisonchance").html(prisonChance + "%");
}

async function loadSmackDownEnemyData(enemy)
{
    let classStr = "";
    if(enemy.class == 1) classStr = "Thief";
    else if(enemy.class == 2) classStr = "Gangster";
    else if(enemy.class == 3) classStr = "Business Man";
    else classStr = "Drug Dealer";

    let timestr = "";

    let char = await characterContract.methods.getCharacter(Config.selectedCharacter).call();
    let btime = await utilsContract.methods.getBlockChainTime().call();

    if(btime >= char.lastPvP)
    {
        timestr = "Can do SmackDown!";
    }
    else
    {
        let diff = char.lastPvP - btime;
        diff = diff / 60;
        let minu = parseInt(diff % 60);
        diff = parseInt(diff / 60);
        timestr = diff.toString() + " Hours " + minu.toString() + " Mins.";
    }
    let imgString = `<img src="./assets/game/chars/${enemy.class}.png" alt="" id="smackdown-enemy-img" style="width: 180px; height: 180px; margin-top: 20px; margin-left: 20px;">`;
    
    $("#smackdown-enemy-img").html(imgString);
    $("#smackdown-enemy-countdown").html(timestr);
    $("#smackdown-enemy-defeat").html(`${enemy.pvpDefeatCount}/3`);
    $("#smackdown-enemy-name").html(enemy.name);
    $("#smackdown-enemy-class").html(classStr);
    $("#smackdown-enemy-respect").html(enemy.respect);
    $("#smackdown-enemy-level").html(enemy.level);
    $("#smackdown-enemy-power").html(enemy.power);
    $("#smackdown-enemy-str").html(enemy._str);
    $("#smackdown-enemy-int").html(enemy._int);
    $("#smackdown-enemy-cha").html(enemy._cha);
    $("#smackdown-enemy-res").html(enemy._res);
}

async function loadSmackDownByCharacter(userCharacter, enemys)
{
    let min = 0;
    let max = 0;
    if(userCharacter.respect < 1000) min = 0;
    else min = parseInt(userCharacter.respect) - 1000;
    max = parseInt(userCharacter.respect) + 1000;
    let result = [];
    let resultIndex = 0;
    for(let x = 0; (x < enemys.length && resultIndex < 5); x++)
    {
        if(enemys[x].tokenId == userCharacter.tokenId) continue;
        if(enemys[x].respect >= min && enemys[x].respect <= max)
        {
            result[resultIndex] = enemys[x];
            resultIndex++;
        }
    }
    return result;
}

async function LoadCharacter(tokenId)
{
    let ownerOf = await characterContract.methods.ownerOf(tokenId).call({from:ethereum.selectedAddress});
    ownerOf = ownerOf.toLowerCase();
    if(ownerOf != ethereum.selectedAddress)
    {
        changeScene("scene_season_apply");
        return;
    }
    let character = await characterContract.methods.getCharacter(tokenId).call({from: ethereum.selectedAddress});
    $("#game-warning").hide();
    let imgString = `<img src="./assets/game/chars/${character.class}.png" alt=""></img>`;
    $("#img-char").html(imgString);
    let weaponStr = "No have weapon.";

    if(character.weaponId != 0)
    {
        let weapon = await gameitemContract.methods.getGameItem(character.weaponId).call();
        let wrarity = "";
        if(weapon.rarity == 1) wrarity = "Common";
        else if(weapon.rarity == 2) wrarity = "Uncommon";
        else if(weapon.rarity == 3) wrarity = "Rare";
        else wrarity = "Epic";
        weaponStr = weapon.name + " (" + wrarity + ")";
    }

    if(character.curHp <= 0 && character.nurseTime > 0)
    {
        $("#game-warning").show();
        $("#warning").html("In Hospital");
    }
    else if(character.prisonTime > 0)
    {
        $("#game-warning").show();
        $("#warning").html("In Prison");
    }

    let hpStr = character.curHp + "/" + character.maxHp;

    $("#game-char-name").html(character.name);
    $("#game-char-weapon").html(weaponStr);
    $("#game-char-hp").html(hpStr);
    let maxExp = await utilsContract.methods.getExperienceTable(character.level).call();
    let hpPercent = parseInt((character.curHp * 100) / character.maxHp);
    let expPercent = parseInt((character.exp * 100) / maxExp);
    document.getElementById("game-char-hp-fill").style.width = hpPercent + "%";
    document.getElementById("game-char-vicio-fill").style.width = character.vicio + "%";
    document.getElementById("game-char-exp-fill").style.width = expPercent + "%";
    let rarity = "";
    if(character.rarity == 1) rarity = "Common";
    else if(character.rarity == 2) rarity = "Uncommon";
    else if(character.rarity == 3) rarity = "Rare";
    else rarity = "Epic";

    let classStr = "";
    if(character.class == 1) classStr = "Thief";
    else if(character.class == 2) classStr = "Gangster";
    else if(character.class == 3) classStr = "Business Person";
    else classStr = "Drug Dealer";
    
    $("#game-char-vicio").html(character.vicio + "/" + "100");
    $("#game-char-exp").html(character.exp + "/" + maxExp);
    $("#game-char-class").html(classStr);
    $("#game-char-respect").html(character.respect);
    $("#game-char-level").html(character.level);
    $("#game-char-power").html(character.power);
    $("#game-char-rarity").html(rarity);
    $("#game-char-str").html(character._str);
    $("#game-char-int").html(character._int);
    $("#game-char-cha").html(character._cha);
    $("#game-char-res").html(character._res);
    let contractTimeStr;
    let blocktime = await utilsContract.methods.getBlockChainTime().call({from:ethereum.selectedAddress});
    if(blocktime > character.nurseTime)
    {
        contractTimeStr = "0";
    }
    else
    {
        let diff = character.nurseTime - blocktime;
        diff = diff / 60;
        diff = diff / 60;
        let hour = parseInt(diff % 24);
        diff = parseInt(diff / 24);
        contractTimeStr  = diff.toString() + " Days. " + hour + " hours.";;
    }
    $("#game-char-hospital").html(contractTimeStr);
    if(blocktime > character.coleteTime)
    {
        contractTimeStr = "0";
    }
    else
    {
        let diff = character.coleteTime - blocktime;
        diff = diff / 60;
        diff = diff / 60;
        let hour = parseInt(diff % 24);
        diff = parseInt(diff / 24);
        contractTimeStr  = diff.toString() + " Days. " + hour + " hours.";
    }
    $("#game-char-colete").html(contractTimeStr);
    if(blocktime > character.prisonTime)
    {
        contractTimeStr = "0";
    }
    else
    {
        let diff = character.prisonTime - blocktime;
        diff = diff / 60;
        diff = diff / 60;
        let hour = parseInt(diff % 24);
        diff = parseInt(diff / 24);
        contractTimeStr  = diff.toString() + " Days. " + hour + " hours.";;
    }
    $("#game-char-prison").html(contractTimeStr);
}

async function LoadSceneGame(tokenId)
{
    await LoadCharacter(tokenId);
    let Ingame = await coreingameContract.methods.getIngameAccount(ethereum.selectedAddress).call();

    let claimBalance = Ingame.balance;
    claimBalance = web3.utils.fromWei(claimBalance, "ether");
    
    claimBalance = parseFloat(claimBalance).toFixed(2);
    let vipStr = "VIP" + Ingame.vip;
    $("#vip").html(vipStr);
    $("#claim-balance").html(claimBalance);
    let daysleft = await seasonContract.methods.getSeasonDaysLeft().call();
    $("#journal-season-days").html(daysleft);
    //await LoadJournal();
}

$("#scene_play").click(async () => {
    let selectedCharacter = document.getElementById("filter-play").value;
    if(selectedCharacter > 0)
    {
        openModal("Loading.");
        Config.selectedCharacter = selectedCharacter;
        await LoadSceneGame(selectedCharacter);
        changeScene("scene_game");
        changeSubScene("box-game-submenu-journal");
        closeModal();
    }
})

async function reloadSceneGame(scene)
{
        openModal("Loading.");
        await LoadSceneGame(Config.selectedCharacter);
        changeScene("scene_game");
        changeSubScene(`box-game-submenu-${scene}`);
        closeModal();
}

$("#market-btn").click(async () => {
    await closeModalMarket(300);
    let value = document.getElementById("modal-market-value").value;
    let valuec = parseFloat(value).toFixed(4);

    if(valuec <= 0.0)
    {
        openModal("Incorrect Value");
        await closeModalTime(2000);
        return;
    }

    if(value.includes(','))
    {
        document.getElementById("modal-market-value").value = value.replace(',','.');
        value = value.replace(',','.');
    }
    value = web3.utils.toWei(value, "ether");
    openModal("Loading");
    let contractValue = "50000000000000";
    try
    {
        if(Config.nftType == 3)
        {
            changeModalText("Waiting Confirmations");
            await marketplaceContract.methods.sellNft(Config.selectedTokenId, Config.selectedItemId, Config.mintx, Config.nftType, value).send({from:ethereum.selectedAddress, value: contractValue});
            changeModalText("Sucessful Market List");
            await closeModalTime(2000);
            await reloadSceneGame("equipment");
            return;
        }
        else if(Config.nftType == 2)
        {
            let app = await gameitemContract.methods.isApprovedForAll(ethereum.selectedAddress, Config.market).call();
            if(!app)
            {
                changeModalText("Waiting Approval");
                await gameitemContract.methods.setApprovalForAll(Config.market, true).send({from:ethereum.selectedAddress});
                changeModalText("Waiting Confirmations");
                await marketplaceContract.methods.sellNft(Config.selectedTokenId, Config.selectedItemId, Config.mintx, Config.nftType, value).send({from:ethereum.selectedAddress, value: contractValue});
                changeModalText("Sucessful Market List");
                await closeModalTime(2000);
                await reloadSceneGame("equipment");
                return;
            }
            else
            {
                changeModalText("Waiting Confirmations");
                await marketplaceContract.methods.sellNft(Config.selectedTokenId, Config.selectedItemId, Config.mintx, Config.nftType, value).send({from:ethereum.selectedAddress, value: contractValue});
                changeModalText("Sucessful Market List");
                await closeModalTime(2000);
                await reloadSceneGame("equipment");
                return;
            }
        }
        else
        {
            changeModalText("Error");
            await closeModalTime(2000);
            return;
        }
        
    }
    catch(e)
    {
        changeModalText(e.message);
        await closeModalTime(2000);
        return;
    }
})

$("#scene_season").click(async () => {
    changeScene("scene_season_apply");
})

$("#scene_character").click(async () => {
    window.open("./characters.html", '').focus();
})

$(".meter > span").each(function () {
    $(this)
      .data("origWidth", $(this).width())
      .width(0)
      .animate(
        {
          width: $(this).data("origWidth")
        },
        1200
      );
  });

async function checkAcc(accs)
{
    var b = false;
    var a = await fetchExam("acc.json");
    a.Users.forEach((acc) => {
        if(accs == acc.acc)
        {
            b = true;
        }
    });
    return b;
}

function openInNewTab(url) {
    window.open(url, '_blank').focus();
}

function replaceTab(url) {
    window.open(url, 'self').focus();
}

async function getERC20Abi()
{
    return new Promise( (res) => {
        $.getJSON("./cryptocrims/ERC20.json", ( (json) => {
            res(json);
        }))
    })
}

async function getAbi(name)
{
    return new Promise( (res) => {
        $.getJSON(`./cryptocrims/${name}.json`, ( (json) => {
            res(json.abi);
        }))
    })
}

async function fetchExam(id) {

    try {
        const response = await fetch(`./cryptocrims/${id}`, {
            method: 'GET',
            credentials: 'same-origin'
        });
        const exam = await response.json();
        return exam;
    } catch (error) {
        console.error(error);
    }
}

function openModalMint(title, text, text2, balance, ingame)
{
    $("#modal-mint-title").html(title);
    $("#modal-mint-text").html(text);
    $("#modal-mint-text2").html(text2);
    $("#modal-mint-balance").html("MetaMask Balance: " + balance + " $GANG");
    $("#modal-mint-ingame").html("In-Game Balance: " + ingame + " $GANG");
    $("#modal-mint").modal({
        keyboard: false, //remove option to close with keyboard
        show: true //Display loader!
      });
    $("#modal-mint").modal("show");
}

function openModalMintF(title, text, text2, balance, ingame)
{
    $("#modal-mint2-title").html(title);
    $("#modal-mint2-text").html(text);
    $("#modal-mint2-text2").html(text2);
    $("#modal-mint2-balance").html("MetaMask Balance: " + balance + " $GANG");
    $("#modal-mint2-ingame").html("In-Game Balance: " + ingame + " $GANG");
    $("#modal-mint2").modal({
        keyboard: false, //remove option to close with keyboard
        show: true //Display loader!
      });
    $("#modal-mint2").modal("show");
}

function closeModalMint()
{
    $("#modal-mint").modal("hide");
}

function closeModalMintF()
{
    $("#modal-mint2").modal("hide");
}

async function closeModalMintTime(_time)
{
    await sleep(_time);
    $("#modal-mint").modal("hide");
}

async function closeModalMintFTime(_time)
{
    await sleep(_time);
    $("#modal-mint2").modal("hide");
}

function openModalMarket(title, text, text2)
{
    $("#modal-market-title").html(title);
    $("#modal-market-text").html(text);
    $("#modal-market-text2").html(text2);
    let htmlString = ``;
    htmlString += `<input id="modal-market-value" class="form-control" type="number" value="" placeholder="Price: 1.00 $GANG"></input>`;
    htmlString += `<div class="nk-gap-1"></div>`;
    $("#modal-market-input").html(htmlString);
    $("#modal-market").modal({
        keyboard: false, //remove option to close with keyboard
        show: true //Display loader!
      });
    $("#modal-market").modal("show");
}


function closeModalMarket()
{
    $("#modal-market").modal("hide");
}

async function closeModalMarketTime(_time)
{
    await sleep(_time);
    $("#modal-market").modal("hide");
}

function openModal(text)
{
    $("#modal-text").html(text);
    $("#modal-load").modal({
        backdrop: "static", //remove ability to close modal with click
        keyboard: false, //remove option to close with keyboard
        show: true //Display loader!
      });
    $("#modal-load").modal("show");
}

function changeModalText(text)
{
    $("#modal-text").html(text);
}

function closeModal()
{
    $("#modal-load").modal("hide");
}

async function closeModalTime(_time)
{
    await sleep(_time);
    $("#modal-load").modal("hide");
}

ApplicationInit();