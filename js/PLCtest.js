"use strict";

const createCommand = () => {
    $("#createToken").on("click", () => {
        const password = $("#password-input").val();
        createTokenInterface(password);
    });

    $("#createToken2").on("click", () => {
        const password = $("#password-input2").val();
        createTokenInterface(password);
    });

    $("#deleteToken").on("click", () => {
        output('<div id="allAuthority"></div><div id="publicKey"></div>');
        balanceOf(user_account).then((balance) => {
            console.log(balance);
            if (Number(balance) > 0) {
                output("トークンが削除されるのを待機しています。");
                deleteToken().on("receipt", (result) => {
                    console.log(result);
                    output("トークンの削除に成功しました。");
                }).on("error", (error) => {
                    console.error(error);
                    output("トークンの削除に失敗しました。");
                });
            } else if (Number(balance) === 0) {
                output("あなたはまだトークンを持っていません。");
            } else {
                output("残高が不明な値です。");
            }
        }, (error) => {
            console.error(error);
            output("残高の取得に失敗しました。");
        });
    });

    $("#checkAuthority").on("click", () => {
        checkAuthorityInterface();
    });

    $("#checkAuthority2").on("click", () => {
        checkAuthorityInterface();
    });

    $("#getTotalSupply").on("click", () => {
        getTotalSupply().then((result) => {
            console.log(result);
            output("ただいまのトークン総発行数は " + result + " 枚です。");
        }, (error) => {
            console.error(error);
            output("総発行量の取得に失敗しました");
        });
    });

    $("#transfer").on("click", () => {
        const to_address = $("#to-address-input").val();
        console.log(to_address);
        if (to_address) {
            ownership(user_account).then((token_id) => {
                console.log(token_id);
                output("トークンが送金されるのを待機しています。");
                transfer(to_address, token_id).on("receipt", (result) => {
                    console.log(result);
                    output("トークンを " + to_address + " に送金しました。");
                }).on("error", (error) => {
                    console.error(error);
                    output("トークンの送金に失敗しました。");
                });
            }, (error) => {
                console.error(error);
                output("あなたはトークンを持っていません。");
            });
        } else {
            output("宛先を入力してください。");
        }
    });

    $("#changePublicKey").on("click", () => {
        const password = $("#new-password-input").val();
        console.log(password);
        if (password.length > 0) {
            ownership(user_account).then((token_id) => {
                console.log(token_id);
                checkAuthority(user_account).then((res) => {
                    const old_n = res.publicKeyN;
                    const old_e = res.publicKeyE;
                    output("パスワードが変更されるのを待機しています。");
                    keyGen(password);
                    const n = myRSAKey.n.toString();
                    const e = String(myRSAKey.e);
                    if (old_n === n && old_e === e) {
                        output("秘密鍵を復元しました。");
                        return;
                    }
                    keyReflesh(n, e).on("receipt", (result) => {
                        console.log(result);
                        localStorage.setItem("RSAKey", stringifyRSAKey(myRSAKey));
                        output("<p>パスワードを変更しました。</p>");
                    }).on("error", (error) => {
                        console.error(error);
                        output("パスワードの変更に失敗しました。");
                    });
                });
            }, (error) => {
                console.error(error);
                output("あなたはトークンを持っていません。");
            });
        } else {
            output("パスワードを入力してください。");
        }
    });

    $("#requestInfoA").on("click", () => {
        requestInfoInterface("salon.pdf");
    });

    $("#requestInfoB").on("click", () => {
        requestInfoInterface("B.pdf");
    });

    $("#requestInfoC").on("click", () => {
        requestInfoInterface("C.pdf");
    });

    $("#requestInfo2").on("click", () => {
        requestInfoInterface("salon.pdf");
    });
};

$(() => {
  try {
    window.myRSAKey = parseRSAKey(JSON.parse(localStorage.getItem("RSAKey")));
  } catch (e) {
    console.log("RSAキーが取得できません。");
  }

  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    // Use Mist/MetaMask's provider
    console.log(web3);
    window.web3js = new Web3(web3.currentProvider);
  } else {
    window.web3js = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/"));;
  }

  window.contract = new web3js.eth.Contract(contractABI, contractAddress);

  web3js.eth.getAccounts((error, accounts) => {
    if (!error) {
        console.log(accounts);
        if (accounts.length > 0) {
            window.user_account = accounts[0];
            createCommand();
        } else {
            output("アカウントが指定されていません。");
        }
    } else {
      console.error(error);
      output("アカウントが指定されていません。");
    }
  });
});

const getTotalSupply = () => {
    return contract.methods.getTotalSupply().call();
};

const balanceOf = (owner) => {
    return contract.methods.balanceOf(owner).call();
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
    return contract.methods.approve(to, token_id).send({from: user_account});
};

const takeOwnership = (token_id) => {
    return contract.methods.takeOwnership(token_id).send({from: user_account});
};

const createToken = (public_key_n, public_key_e) => {
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

const output = (html) => {
    $(".output").each((i, e) => {
        $(e).html(html);
    });
};

const createTokenInterface = (password) => {
    if (password.length > 0) {
        balanceOf(user_account).then((balance) => {
            console.log(balance);
            if (Number(balance) === 0) {
                output("トークンが作成されるのを待機しています。");
                keyGen(password);
                const n = myRSAKey.n.toString();
                const e = String(myRSAKey.e);
                createToken(n, e).on("receipt", (result) => {
                    console.log(result);
                    localStorage.setItem("RSAKey", stringifyRSAKey(myRSAKey));
                    output("登録されました。");
                }).on("error", (error) => {
                    console.error(error);
                    output("トークンの作成に失敗しました。");
                });
            } else if (Number(balance) > 0) {
                output("あなたはすでにトークンを持っています。");
            } else {
                output("残高が不明な値です。");
            }
        }, (error) => {
            console.error(error);
            output("残高の取得に失敗しました。");
        });
    } else {
        output("パスワードを入力してください。");
    }
};

const checkAuthorityInterface = () => {
    balanceOf(user_account).then((balance) => {
        console.log(balance);
        if (Number(balance) > 0) {
            checkAuthority(user_account).then((authority) => {
                console.log(authority);
                output("<p>あなたが持っている権限は次のとおりです。<ul>"
                    + "<li>権利の所有：" + (authority.isHolder ? "あり" : "なし") + "</li>"
                    + "</ul></p>");
            }, (error) => {
                console.error(error);
                output("トークンの取得に失敗しました");
            });
        } else if (Number(balance) === 0) {
            output("あなたはまだトークンを持っていません。");
        } else {
            output("残高が不明な値です。");
        }
    }, (error) => {
        console.error(error);
        output("残高の取得に失敗しました。");
    });
};

const requestInfoInterface = (file_name) => {
    output("残高を取得しています。");
    balanceOf(user_account).then((balance) => {
        console.log(balance);
        if (Number(balance) > 0) {
            output("暗号化されたデータを解読中です。");
            requestInfo(user_account, file_name);
        } else if (Number(balance) === 0) {
            output("あなたはまだトークンを持っていません。");
        } else {
            output("残高が不明な値です。");
        }
    });
};

function requestInfo(owner, file_name) {
    const sign = signRSA("1".concat("0".repeat(200)));
    const req = {
        url: "https://hz9dwl2145.execute-api.ap-northeast-1.amazonaws.com/test/web3-lambda",
        method: "GET",
        crossDomain: true,
        cache: false,
        contentType: "application/json",
        dataType: "json",
        data: {
            owner: owner, // encodeURIComponent(owner)
            sign: sign,
            file_name: file_name
        }
    };
    $.ajax(req).done(res => {
        if (res) {
            output("データが取得できました。新しい画面が開いて中身を確認できるはずです。");
            window.open(res);
        } else {
            output("権限を確認できませんでした。");
        }
    }).fail(error => {
      console.log("fail");
    });
}

function parseRSAKey(keyJSON) {
    if (keyJSON) {
        return {
            coeff: new BigInteger(keyJSON.coeff),
            d: new BigInteger(keyJSON.d),
            dmp1: new BigInteger(keyJSON.dmp1),
            dmq1: new BigInteger(keyJSON.dmq1),
            e: keyJSON.e,
            n: new BigInteger(keyJSON.n),
            p: new BigInteger(keyJSON.p),
            q: new BigInteger(keyJSON.q)
        };
    }
}

function stringifyRSAKey(RSAKey) {
    if (RSAKey) {
        return JSON.stringify({
            coeff: RSAKey.coeff.toString(),
            d: RSAKey.d.toString(),
            dmp1: RSAKey.dmp1.toString(),
            dmq1: RSAKey.dmq1.toString(),
            e: RSAKey.e,
            n: RSAKey.n.toString(),
            p: RSAKey.p.toString(),
            q: RSAKey.q.toString()
        });
    }
}

const keyGen = (pass) => {
    window.myRSAKey = cryptico.generateRSAKey(pass, 1024);
};

const popUpKeygen = () => {
    alert("鍵を作成して下さい");
};

const decrypt = (m_list) => {
    if (!window.myRSAKey) {
        popUpKeygen();
    }

    let result_url = "";
    const big_d = myRSAKey.d;
    const big_n = myRSAKey.n;

    m_list.forEach((m) => {
        const big_m = new BigInteger(m);
        const char = big_m.modPow(big_d, big_n).divide(new BigInteger("1" + Array(200).fill("0").join(""))).toString();
        const str = String.fromCharCode(char);
        result_url += str;
    });
    return result_url;
};

function signRSA(intd) {
    if (myRSAKey) {
        const d = myRSAKey.d;
        const n = myRSAKey.n;
        const m = new BigInteger(intd);
        return m.modPow(d, n).toString();
    } else {
        console.log("Could not find your private key.");
    }
}
