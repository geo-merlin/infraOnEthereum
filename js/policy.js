
var contract;
window.addEventListener('load', function() {

  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    // Use Mist/MetaMask's provider
    web3js = new Web3(web3.currentProvider);
  } else {
    // Handle the case where the user doesn't have web3. Probably 
    // show them a message telling them to install Metamask in 
    // order to use our app.
  }

  // Now you can start your app & access web3js freely:
  startApp()
})

function startApp() {
    var Address = "YOUR_CONTRACT_ADDRESS";
    contract = new web3js.eth.Contract(ABI, Address);
}

function KeyResister(key,token_id){
    contract.KeyReflesh(key,token_id);
}

function getMyToken(my_address){
    var tokens = contract.checkAllToken(my_address);
    tokens.forEach(function(d){
        visibleToken(d);
    })
} 

function requireInfo(my_address,token){
    
    var hash = hashURL(news_url);
    var api_url = "https://";
    var header = {
        url: api_url,
        contentType: "application/json",
        dataType: "json",
        cache: false,
        type: "GET",
        data: {
            name: "MODAL",
            req: hash
        }
    };
    var f = function (res) {
    };
    var g = function (res) {
        console.log(res);
    };

    $.ajax(header).done(f).fail(g).always(searchTweetsByKeyword);
}

