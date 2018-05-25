var contract;
var userAccount;
var policytokenContract;
var web3;

window.addEventListener('load', () => {
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
  web3.eth.getAccounts((error, accounts) => {
    if (!error) {
        userAccount = accounts[0];

        $("#createToken").on("click", () => {
            const adminAuthority = false;
            const holderAuthority = false;
            const workerAuthority = false;
            const publicKey = $("#public-key-input").val();
            console.log(publicKey);
            createAccount(adminAuthority, holderAuthority, workerAuthority, publicKey).then((result) => {
                console.log(result);
                $("#outputs").html("公開鍵" + publicKey + "でトークンを作成しました。");
            }, (error) => {
                console.log(error);
                $("#outputs").html("トークンの作成に失敗しました。");
            });
        });

        $("#checkAuthority").on("click", () => {
            $("#outputs").html('<div id="allAuthority"></div><div id="publicKey"></div>');
            checkAuthority(userAccount).then((all_authority) => {
                console.log(all_authority);
                $("#allAuthority").html("<p>あなたが持っている権限は次のとおりです。<ul>"
                + "<li>国の管理権限：" + (all_authority.isAdmin ? "あり" : "なし") + "</li>"
                + "<li>株の所有：" + (all_authority.isHolder ? "あり" : "なし") + "</li>"
                + "<li>会社権限：" + (all_authority.isWorker ? "あり" : "なし") + "</li>"
                + "</ul></p><p>公開鍵は" + all_authority.publicKey + "です。</p>");
            }, (error) => {
                console.log(error);
                $("#allAuthority").html("トークンの取得に失敗しました");
            });
        });

        $("#changePublicKey").on("click", () => {
            const publicKey = $("#public-key-input").val();
            console.log(publicKey);
            ownershipTokenId(userAccount).then((tokenId) => {
                console.log(tokenId);
                if (tokenId > 0) {
                    keyReflesh(publicKey, tokenId).then((result) => {
                        console.log(result);
                        $("#outputs").html("公開鍵を" + publicKey + "に変更しました。");
                    }, (error) => {
                        console.log(error);
                        $("#outputs").html("公開鍵の変更に失敗しました。");
                    });
                } else {
                    $("#outputs").html("あなたはトークンを持っていません。");
                }
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

const allToken = (owner) => {
    return contract.methods.balanceOf(owner).call();
};

const ownerOf = (token_id) => {
    return contract.methods.ownerOf(token_id).call();
};

const transfer = (to, token_id) => {
    return contract.methods.transfer(to, token_id).call({from: userAccount});
};

const approve = (to, token_id) => {
    return contract.methods.transfer(to, token_id).call({from: userAccount});
};

const takeOwnership = (token_id) => {
    return contract.methods.takeOwnership(token_id).call({from: userAccount});
};

const ownershipTokenId = (owner) => {
    return contract.methods.ownershipTokenId(owner).call();
};

const createAccount = (adminAuthority, holderAuthority, workerAuthority, publicKey) => {
    return contract.methods.createToken(adminAuthority, holderAuthority, workerAuthority, publicKey).call({from: userAccount});
}

const deleteToken = (token_id) => {
    return contract.methods.deleteToken(userAccount).call({from: userAccount});
};

const checkAuthority = (owner) => {
    return contract.methods.checkAuthority(owner).call();
};

const checkPublicKey = (owner) => {
    return contract.methods.checkPublicKey(owner).call();
};

const keyReflesh = (new_public_key, token_id) => {
    return contract.methods.keyReflesh(new_public_key, token_id).call();
};

const startApp = () => {
    contract = new web3.eth.Contract(contractABI, contractAddress);
};

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
