var contract;
var userAccount;
var policytokenContract;
var web3;

window.addEventListener('load', function() {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    // Use Mist/MetaMask's provider
    web3 = new Web3(web3.currentProvider);
  } else {
    web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/"));;
    // Handle the case where the user doesn't have web3. Probably
    // show them a message telling them to install Metamask in
    // order to use our app.
  }

  // Now you can start your app & access web3 freely:
  web3.eth.getAccounts(function(error, accounts) {
    if (!error) {
        userAccount = accounts[0];

        $("#createToken").on("click", () => {
            const adminAuthority = false;
            const holderAuthority = false;
            const workerAuthority = false;
            const publicKey = $("#public-key-input").val();
            console.log(publicKey);
            createAccount(adminAuthority, holderAuthority, workerAuthority, publicKey).then((result) => {
                $("#outputs").html("公開鍵" + result + "でトークンを作成しました。");
            }, (error) => {
                console.log(error);
                $("#outputs").html("トークンの作成に失敗しました。");
            });
        });

        $("#checkAllAuthority").on("click", () => {
            $("#outputs").html('<div id="allAuthority"></div><div id="publicKey"></div>');
            checkAllAuthority(userAccount).then((all_authority) => {
                console.log(all_authority);
                $("#allAuthority").html("あなたが持っている権限は次のとおりです。<ul>"
                + "<li>国の管理権限：" + (all_authority[0] ? "あり" : "なし") + "</li>"
                + "<li>株の所有：" + (all_authority[1] ? "あり" : "なし") + "</li>"
                + "<li>会社権限：" + (all_authority[2] ? "あり" : "なし") + "</li>"
                + "</ul>");
            }, (error) => {
                console.log(error);
                $("#allAuthority").html("権限の取得に失敗しました");
            });
            checkPublicKey(userAccount).then((public_key) => {
                console.log(public_key);
                $("#publicKey").html("公開鍵は" + public_key + "です。");
            }, (error) => {
                console.log(error);
                $("#publicKey").html("公開鍵の取得に失敗しました");
            });
        });

        $("#changePublicKey").on("click", () => {
            const publicKey = $("#public-key-input").val();
            console.log(publicKey);
            ownershipTokenId(userAccount).then((tokenId) => {
                console.log(tokenId);
                keyReflesh(publicKey, tokenId).then((result) => {
                    $("#outputs").html("公開鍵を" + result + "に変更しました。");
                }, (error) => {
                    console.log(error);
                    $("#outputs").html("公開鍵の変更に失敗しました。");
                });
            }, (error) => {
                console.log(error);
                $("#outputs").html("トークンの取得に失敗しました。");
            });
        });

        startApp();
    } else {
      console.error(error);
      $("#outputs").html("アカウントが指定されていません。");
    }
  });

});

const ownershipTokenId = () => {
    return contract.methods.ownershipTokenId(userAccount).call();
};

const createAccount = (adminAuthority, holderAuthority, workerAuthority, publicKey) => {
    return contract.methods.createToken(adminAuthority, holderAuthority, workerAuthority, publicKey).call({from: userAccount});
}

const checkAllAuthority = () => {
    return contract.methods.checkAllAuthority(userAccount).call();
};

const checkPublicKey = () => {
    return contract.methods.checkPublicKey(userAccount).call();
};

const keyReflesh = (new_public_key, token_id) => {
    return contract.methods.keyReflesh(new_public_key, token_id).call();
};

const startApp = () => {
    contract = new web3.eth.Contract(contractABI, contractAddress);
};


// function startApp() {
//     var Address = "YOUR_CONTRACT_ADDRESS";
//     contract = new web3.eth.Contract(ABI, Address);
// }

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
