var contract;
var user_account;
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
        user_account = accounts[0];
        contract = new web3.eth.Contract(contractABI, contractAddress);

        $("#createToken").on("click", () => {
            const public_key_n = $("#public-key-n-input").val();
            const public_key_e = $("#public-key-e-input").val();
            console.log(public_key_n, public_key_e);
            if (public_key_n.length > 0 && public_key_e.length > 0) {
                balanceOf(user_account).then((balance) => {
                    console.log(balance);
                    if (Number(balance) === 0) {
                        $("#outputs").html("トークンが作成されるのを待機しています。");
                        createAccount(public_key_n, public_key_e).on("receipt", (result) => {
                            console.log(result);
                            $("#outputs").html("公開鍵 " + public_key + " でトークンを作成しました。");
                        }).on("error", (error) => {
                            console.error(error);
                            $("#outputs").html("トークンの作成に失敗しました。");
                        });
                    } else if (Number(balance) > 0) {
                        $("#outputs").html("あなたはすでにトークンを持っています。");
                    } else {
                        $("#outputs").html("残高が不明な値です。");
                    }
                }, (error) => {
                    console.error(error);
                    $("#outputs").html("残高の取得に失敗しました。");
                });
            } else {
                $("#outputs").html("公開鍵を入力してください。");
            }
        });

        $("#checkAuthority").on("click", () => {
            $("#outputs").html('<div id="allAuthority"></div><div id="publicKey"></div>');
            checkAuthority(user_account).then((authority) => {
                console.log(authority);
                $("#allAuthority").html("<p>あなたが持っている権限は次のとおりです。<ul>"
                + "<li>国の管理権限：" + (authority.isAdmin ? "あり" : "なし") + "</li>"
                + "<li>株の所有：" + (authority.isHolder ? "あり" : "なし") + "</li>"
                + "<li>会社権限：" + (authority.isWorker ? "あり" : "なし") + "</li>"
                + "</ul></p><p>公開鍵は次のとおりです。<ul>"
                + "<li>N: " + authority.publicKeyN + "</li>"
                + "<li>E: " + authority.publicKeyE + "</li>"
                + "</ul></p>");
            }, (error) => {
                console.error(error);
                $("#allAuthority").html("トークンの取得に失敗しました");
            });
        });

        $("#transfer").on("click", () => {
            const to_address = $("#to-address-input").val();
            console.log(to_address);
            if (to_address) {
                ownership(user_account).then((token_id) => {
                    console.log(token_id);
                    $("#outputs").html("トークンが送金されるのを待機しています。");
                    transfer(to_address, token_id).on("receipt", (result) => {
                        console.log(result);
                        $("#outputs").html("トークンを " + to_address + " に送金しました。");
                    }).on("error", (error) => {
                        console.error(error);
                        $("#outputs").html("トークンの送金に失敗しました。");
                    });
                }, (error) => {
                    console.error(error);
                    $("#outputs").html("あなたはトークンを持っていません。");
                });
            } else {
                $("#outputs").html("宛先を入力してください。");
            }
        });

        $("#changePublicKey").on("click", () => {
            const public_key_n = $("#new-public-key-n-input").val();
            const public_key_e = $("#new-public-key-e-input").val();
            console.log(public_key_n, public_key_e);
            if (public_key_n.length > 0 && public_key_e.length > 0) {
                ownership(user_account).then((token_id) => {
                    console.log(token_id);
                    $("#outputs").html("公開鍵が変更されるのを待機しています。");
                    keyReflesh(public_key_n, public_key_e).on("receipt", (result) => {
                        console.log(result);
                        $("#outputs").html("<p>公開鍵を次のように変更しました。<ul>"
                        + "<li>N: " + public_key_n + "</li>"
                        + "<li>E: " + public_key_e + "</li>"
                        + "</ul></p>");
                    }).on("error", (error) => {
                        console.error(error);
                        $("#outputs").html("公開鍵の変更に失敗しました。");
                    });
                }, (error) => {
                    console.error(error);
                    $("#outputs").html("あなたはトークンを持っていません。");
                });
            } else {
                $("#outputs").html("公開鍵を入力してください。");
            }
        });
    } else {
      console.error(error);
      $("#outputs").html("アカウントが指定されていません。");
    }
  });

});

const balanceOf = (owner) => {
    return contract.methods.ownership(owner).call();
};

const ownership = (owner) => {
    return contract.methods.ownership(owner).call();
};

const ownerOf = (token_id) => {
    return contract.methods.ownerOf(token_id).call();
};

const transfer = (to, token_id) => {
    return contract.methods.transfer(to, token_id).send({from: user_account});
};

const approve = (to, token_id) => {
    return contract.methods.transfer(to, token_id).send({from: user_account});
};

const takeOwnership = (token_id) => {
    return contract.methods.takeOwnership(token_id).send({from: user_account});
};

const createAccount = (public_key_n, public_key_e) => {
    return contract.methods.createToken(public_key_n, public_key_e).send({from: user_account});
}

const deleteToken = () => {
    return contract.methods.deleteToken().send({from: user_account});
};

const checkAuthority = (owner) => {
    return contract.methods.checkAuthority(owner).call();
};

const keyReflesh = (public_key_n, public_key_e) => {
    return contract.methods.keyReflesh(public_key_n, public_key_e).send({from: user_account});
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
