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
var webutilsContract;
var rankingContract;
var characterutilsContract;
var coreContract;
var coreingameContract;
var equipmentContract;
var hospitalprisonContract;
var robberyContract;
var tradeContract;
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
    robbery: "",
    trade: "",
    pvp: "",
    gasPriceVeryFast: "",
    gasLimitVeryFast: "",
    gasPriceFast: "",
    web: "",
    gasLimitFast: "",
    filter: 1,
    pages: 1,
    pageId: 1,
    mintx: 1
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
    Config.trade = Configs.Config[0].trade;

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
    robberyContract = new web3.eth.Contract(await getAbi("Robbery"), Config.robbery);
    pvpContract = new web3.eth.Contract(await getAbi("PvP"), Config.pvp);
    factoryContract = new web3.eth.Contract(await getAbi("Factory"), Config.factory);
    seasonContract = new web3.eth.Contract(await getAbi("SeasonManager"), Config.seasonManager);
    marketplaceContract = new web3.eth.Contract(await getAbi("MarketPlace"), Config.marketplace);
    tradeContract = new web3.eth.Contract(await getAbi("Trade"), Config.trade);

}
let canSelect = true;
let canSelectChars = false;

var inverseTrade = "False";
var tokenIn = "";
var tokenOut = "";

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
    await GlobalSettings();
    $("#metamask-str").html("MetaMask");

    window.web3 = await getWeb3();
    
    var acc = ethereum.selectedAddress;

    if(acc == null)
    {
        $("#metamask-str").html("Metamask");
    }
    else
    {
        try
        {
            acc = acc.substring(0,5) + "...";
            $("#metamask-str").html(acc);

            await LoadContracts();
            
            let contractSymbol = await gangContract.methods.symbol().call({from: ethereum.selectedAddress});
            let claimBalance = await coreingameContract.methods.getIngameAccount(ethereum.selectedAddress).call();
            claimBalance = claimBalance.balance;
            claimBalance = web3.utils.fromWei(claimBalance, "ether");
            claimBalance = parseFloat(claimBalance).toFixed(2);           
            $("#claim-balance").html(claimBalance);

            let wbalance = await gangContract.methods.balanceOf(ethereum.selectedAddress).call();
            wbalance = web3.utils.fromWei(wbalance, "ether");
            wbalance = parseFloat(wbalance).toFixed(2);
            console.log(wbalance);

            $("#wbalance").html(wbalance + " $GANG");
            
            $("#trade-tokenin-symbol").html("$BNB");
            $("#trade-tokenout-symbol").html("$" + contractSymbol);

            await CheckAllowanceStation();
        }
        catch(e)
        {
            console.log(e);
            await sleep(10000);
            //window.close();
        }
    }
}

async function getAbi(name)
{
    return new Promise( (res) => {
        $.getJSON(`./cryptocrims/${name}.json`, ( (json) => {
            res(json.abi);
        }))
    })
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function CheckAllowanceStation()
{
    if(tokenIn == "WBNB" && tokenOut == "GANG")
    {
        document.getElementById("trade-button").value = "Trade";
        return true;
    }
    else
    {
        let allw = await gangContract.methods.allowance(ethereum.selectedAddress, Config.trade).call({from: ethereum.selectedAddress});
        let symbol = await gangContract.methods.symbol().call({from: ethereum.selectedAddress});

        if(allw <= "1000000000000000000000000")
        {
            document.getElementById("trade-button").value = ("Approve " + symbol);
            return false;
            //let b = "1000000000000000000000"
            //await bnb.methods.approve(addresses.router, b).send({from: ethereum.selectedAddress});
        }
        else
        {
            document.getElementById("trade-button").value = "Trade";
            return true;
        }
    }
}

async function Trade()
{
    var CanTrade = await CheckAllowanceStation();
    let contractValue = "50000000000000";
    let acc = ethereum.selectedAddress;
    if(!acc)
    {
        openModal("Please Connect Metamask");
        await closeModalTime(3000);
    }

    if(CanTrade)
    {
        if(tokenIn == "WBNB")
        {
            try
            {
                let tradeamount = document.getElementById("trade-tokenin-amount").value;
                if(tradeamount.includes(','))
                {
                    document.getElementById("trade-tokenin-amount").value = tradeamount.replace(',','.');
                    tradeamount = tradeamount.replace(',','.');
                }

                tradeamount = web3.utils.toWei(tradeamount, "ether");
                openModal("Waiting Confirmations.");
                const tx = await tradeContract.methods.tradeGang().send({
                    from: ethereum.selectedAddress,
                    value: tradeamount
                    });

                    changeModalText("Successful trade.");
                    await closeModalTime(3000);
            }
            catch (e)
            {
                changeModalText(e.message);
                await closeModalTime(2000);
                return;
            }
            return;
        }
        else
        {
            let tradeamount = document.getElementById("trade-tokenin-amount").value;
            if(tradeamount.includes(','))
            {
                document.getElementById("trade-tokenin-amount").value = tradeamount.replace(',','.');
                tradeamount = tradeamount.replace(',','.');
            }
            tradeamount = web3.utils.toWei(tradeamount, "ether");
            try
            {
                const tx = await tradeContract.methods.sellGang(tradeamount).send({
                    from: ethereum.selectedAddress,
                    value: contractValue
                    });
                        
                console.log(tx);
            }
            catch (e)
            {
                changeModalText(e.message);
                await closeModalTime(2000);
                return;
            }
            return;
        }
    }
    else
    {
        //Approve
        if(tokenIn == "WBNB")
        {
            await CheckAllowanceStation();
            return;
        }
        else
        {
            let Approval_amount = "10000000000000000000000000";
            let Approval = await gangContract.methods.approve(Config.trade, Approval_amount).send({from: ethereum.selectedAddress});
            if(Approval)
            {
                await CheckAllowanceStation();
                return;
            }
        }
    }
}

document.getElementById("trade-tokenin-amount").addEventListener('change', async function() {
    let amountspend = document.getElementById("trade-tokenin-amount").value;
    if(amountspend.includes(','))
    {
        document.getElementById("trade-tokenin-amount").value = amountspend.replace(',','.');
        amountspend = amountspend.replace(',','.');
    }

    if(tokenIn == "WBNB" && tokenOut == "GANG")
    {
        let z = parseFloat(amountspend / 0.02);
        amountspend = web3.utils.toWei(amountspend, "ether");
        document.getElementById("trade-tokenout-amount").value = z;
    }
    else if(tokenOut == "WBNB" && tokenIn == "GANG")
    {
        let z = parseFloat(amountspend * 0.02);
        amountspend = web3.utils.toWei(amountspend, "ether");
        document.getElementById("trade-tokenout-amount").value = z;
    }
    else
    {
        document.getElementById("trade-tokenin-amount").value = "0.0";
        document.getElementById("trade-tokenout-amount").value = "0.0";
        return;
    }
});

async function changeTradeInversion()
{
    
    let erc20abi = await getERC20Abi();
    let contractSymbol;

    try
    {
        contractSymbol = await gangContract.methods.symbol().call({from: ethereum.selectedAddress});
        
            
    } catch(e)
    {
        return;
    }
    if(inverseTrade == "False")
    {
        inverseTrade = "True";
        tokenIn = "GANG";
        tokenOut = "WBNB";
        let inverse = document.getElementById("trade-tokenin-amount").value;
        let inverseB = document.getElementById("trade-tokenout-amount").value;
        document.getElementById("trade-tokenin-amount").value = inverseB;
        document.getElementById("trade-tokenout-amount").value = inverse;
        document.getElementById("trade-tokenin-symbol").value = contractSymbol;
        document.getElementById("trade-tokenout-symbol").value = "BNB";
        $("#trade-tokenout-symbol").html("$BNB");
        $("#trade-tokenin-symbol").html("$" + contractSymbol);
        let amountspend = document.getElementById("trade-tokenin-amount").value;
        if(amountspend != "")
        {
            let z = parseFloat(amountspend * 0.02);
            amountspend = web3.utils.toWei(amountspend, "ether");
            document.getElementById("trade-tokenout-amount").value = z;
        }
    }
    else if(inverseTrade == "True")
    {
        inverseTrade = "False";
        tokenOut = "GANG";
        tokenIn = "WBNB";
        let inverse = document.getElementById("trade-tokenin-amount").value;
        let inverseB = document.getElementById("trade-tokenout-amount").value;
        document.getElementById("trade-tokenin-amount").value = inverseB;
        document.getElementById("trade-tokenout-amount").value = inverse;
        document.getElementById("trade-tokenin-symbol").value = "BNB";
        document.getElementById("trade-tokenout-symbol").value = contractSymbol;
        $("#trade-tokenin-symbol").html("$BNB");
        $("#trade-tokenout-symbol").html("$" + contractSymbol);
        let amountspend = document.getElementById("trade-tokenin-amount").value;
        if(amountspend != "")
        {
            let z = parseFloat(amountspend / 0.02);
            amountspend = web3.utils.toWei(amountspend, "ether");
            document.getElementById("trade-tokenout-amount").value = z;
        }
    }

    await CheckAllowanceStation();
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

$("#trade-button").click(async () => {
    await Trade();
})

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

async function getFactoryAbi()
{
    return new Promise( (res) => {
        $.getJSON("./assets/js/factory.json", ( (json) => {
            res(json);
        }))
    })
}

async function getERC20Abi()
{
    return new Promise( (res) => {
        $.getJSON("./cryptocrims/ERC20.json", ( (json) => {
            res(json);
        }))
    })
}

async function getEvenAbi()
{
    return new Promise( (res) => {
        $.getJSON("./assets/js/Even.json", ( (json) => {
            res(json.abi);
        }))
    })
}

async function getEvenCoreInAbi()
{
    return new Promise( (res) => {
        $.getJSON("./assets/js/EvenCoreInGame.json", ( (json) => {
            res(json.abi);
        }))
    })
}

async function getEvenCoreAbi()
{
    return new Promise( (res) => {
        $.getJSON("./assets/js/EvenCore.json", ( (json) => {
            res(json.abi);
        }))
    })
}

async function getEvenTradeAbi()
{
    return new Promise( (res) => {
        $.getJSON("./assets/js/EvenTrade.json", ( (json) => {
            res(json.abi);
        }))
    })
}

async function getEvenSquadAbi()
{
    return new Promise( (res) => {
        $.getJSON("./assets/js/EvenSquad.json", ( (json) => {
            res(json.abi);
        }))
    })
}

async function getEvenCharAbi()
{
    return new Promise( (res) => {
        $.getJSON("./assets/js/EvenCharacter.json", ( (json) => {
            res(json.abi);
        }))
    })
}

async function getEvenHouseAbi()
{
    return new Promise( (res) => {
        $.getJSON("./assets/js/EvenHouse.json", ( (json) => {
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