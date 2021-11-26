let srx_val = 0;

window.onload = function () {
    getTokenPrice();
    getStats();
    checkCache();
}

function loadKeyStore() {
  const content = document.querySelector('.content');
  const [file] = document.querySelector('input[type=file]').files;
  const reader = new FileReader();

  reader.addEventListener("load", () => {
    res = JSON.parse(reader.result);
    document.getElementById("walletAdd").value = "xdc" + res.address;
  }, false);

  if (file) {
    reader.readAsText(file);
  }
}

function getStats(){
  fetch("https://farmerapi.storx.io/get-stats").then(res => res.text()).then(data => {
    data = JSON.parse(data);
    var labelValue = (Math.round(data['data']['staked_amount']/10**18 * srx_val));
    labelValue = Math.abs(Number(labelValue)) >= 1.0e+9 ? (Math.abs(Number(labelValue)) / 1.0e+9).toFixed(2) + "B" : Math.abs(Number(labelValue)) >= 1.0e+6 ? (Math.abs(Number(labelValue)) / 1.0e+6).toFixed(2) + "M": Math.abs(Number(labelValue))
    document.getElementById("tvl").innerHTML = "TVL: $" + labelValue;
    document.getElementById("count").innerHTML = "Staked Nodes: " + data['data']['stakeholder_count']});
  }

function checkCache(){
    document.getElementById("cacheBtn").innerHTML = '<button type="button" class="btn btn-success mb-2" onclick="cacheAddress()">Save Address</button> ';
    document.getElementById("cacheBtn").innerHTML += '<button type="button" class="btn btn-info mb-2" onclick="loadAddress()">Load Cached Address</button> <button type="button" class="btn btn-danger mb-2" onclick="localStorage.clear(); window.location.reload();">Clear Cached Address</button>';
}

function loadAddress(){
  var add = [];
  add.push(localStorage.getItem("cache"));
  cachedAdd(add)
}

function cachedAdd(array){ 
  array = array[0].split(",");
  var select = document.getElementById("cachedAdd");
  if (document.getElementById("mySelect") == null){
    var selectList = document.createElement("select");
    selectList.id = "mySelect";
    selectList.className = "mt-4 form-control w-75 mx-auto";
    select.appendChild(selectList);
    var option = document.createElement("option");
    option.selected;
    option.disabled;
    option.text = "Select an XDC Address from Menu";
    selectList.appendChild(option);
      for(i=0; i < array.length; i++){
        var option = document.createElement("option");
        option.className = "form-select";
        option.value = array[i];
        option.text = "["+ (i+1) + "]: " + array[i];
        selectList.appendChild(option);
    }
  }
  document.getElementById('mySelect').onchange = function() {
    document.getElementById("walletAdd").value = document.getElementById("mySelect").value;
  };
}

function getTokenPrice(){
    fetch("https://farmerapi.storx.io/get-asset-price").then(res => res.text()).then(data => {
    data = JSON.parse(data);
    document.getElementById("srx").innerHTML = "SRX: $" + data['data']['SRXUSDT'];
    document.getElementById("xdc").innerHTML = "XDC: $" + data['data']['XDCUSDT'];
    srx_val = data['data']['SRXUSDT'];
    });
} 

function cacheAddress(){
  if (document.getElementById("walletAdd").value != "") {
    var addresses = [];
    if (typeof(Storage) !== "undefined") {
      if (localStorage.getItem("cache") == null){
        addresses.push(walletAdd.value.toLowerCase())
        console.log("[SAVE TO CACHE]", walletAdd.value.toLowerCase());
        localStorage.setItem("cache", walletAdd.value.toLowerCase());
        window.location.reload();
        alert("[Cached] XDC Address: " + walletAdd.value.toLowerCase());
      }
      else {
        addresses.push(walletAdd.value.toLowerCase());
        addresses.push(localStorage.getItem("cache"))
        console.log("[SAVE TO CACHE]", walletAdd.value.toLowerCase());
        localStorage.setItem("cache", addresses);
        window.location.reload();
        alert("[Cached] XDC Address: " + walletAdd.value.toLowerCase());
      }
    }
  }
    else 
      alert("Address is needed to perform contract lookup");
  }

  function fetchData(){
    getTokenPrice();
    if (document.getElementById("walletAdd").value != "") {
      document.getElementById("walletInfo").innerHTML = "";
      fetch("https://farmerapi.storx.io/get-contract-data").then(res => res.text()).then(data => {
      data = JSON.parse(data);
      address = walletAdd.value.toLowerCase().replace("xdc", "0x");
      if (data['data']['stakeHolders'][address] != null) {
      document.getElementById("walletInfo").innerHTML += "<br>---Found Contract Data!---<br><br>Contract Address: " + address;
      document.getElementById("walletInfo").innerHTML += "<br>Farmer Node Contact HASH: " + data['data']['stakeHolders'][address]['contact'];
      document.getElementById("walletInfo").innerHTML += "<br><br>StorX Node Reputation: " + data['data']['stakeHolders'][address]['reputation'];
      if (data['data']['stakeHolders'][address]['reputation'] >= 10)
        document.getElementById("walletInfo").innerHTML += "<br>Farmer Status: <span style='color:green;'>True!</span>";
      else
        document.getElementById("walletInfo").innerHTML += "<br>Farmer Node Status: <span style='color:red;'>False!</span>";
      document.getElementById("walletInfo").innerHTML += "<br><br>Staked SRX: " + data['data']['stakeHolders'][address]['stake']['stakedAmount']/10**18;
      document.getElementById("walletInfo").innerHTML += "<br>Claimable SRX Balance: " + data['data']['stakeHolders'][address]['stake']['balance'];
      document.getElementById("walletInfo").innerHTML += "<br>SRX Total Redeemed: " + data['data']['stakeHolders'][address]['stake']['totalRedeemed']/10**18;
      document.getElementById("walletInfo").innerHTML += "<br><br>Date SRX Staked: " + moment(data['data']['stakeHolders'][address]['stake']['stakedTime'] * 1000).format("LLL");   
      document.getElementById("walletInfo").innerHTML += "<br>Rewards Last Redeemed On " + moment(data['data']['stakeHolders'][address]['stake']['lastRedeemedAt'] * 1000).format("LLL");    
      document.getElementById("walletInfo").innerHTML += "<br>Next Rewards Redeemable from " + moment(data['data']['stakeHolders'][address]['stake']['lastRedeemedAt'] * 1000).add(30, "days").format("LLL");
      document.getElementById("walletInfo").innerHTML += "<br><br><button class='btn btn-primary'>Block Explorer Link: " + "<a href='https://explorer.xinfin.network/addr/"+ address.replace("0x", "xdc") + "'><img src='https://img.icons8.com/material-two-tone/12/000000/external-link.png'/></a></button>";
    }
      else {
        document.getElementById("walletInfo").innerHTML += "<br>---No Contract Data Found!---<br>XDC Address: " + address;
        document.getElementById("walletInfo").innerHTML += "<br>Reputation is below 1, Check back soon!";
      }
  }) }
  else
    alert("Address is needed to perform contract lookup");
}