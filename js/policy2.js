"use strict";

let my_rsa_key;
let web3js;
let contract;
let methods;
let user_account;
let ownership_token_ids;
let current_token_id;
let subordinate_token_id;
let main_token_id;
let sub_token_id;
const api_url = "https://64dneqe5wc.execute-api.ap-northeast-1.amazonaws.com/prod/web3node";
const api_url2 = "https://64dneqe5wc.execute-api.ap-northeast-1.amazonaws.com/prod/MTKpy";

const output = (html) => {
    $(".output").each((i, e) => {
        $(e).html(html);
    });
};

const changeAnotherToken = (token_id) => {
    current_token_id = String(token_id);
    showMyTokens();
};

const showMyTokens = () => {
    let tokens = ownership_token_ids.map((v) => `<li><a onclick="changeAnotherToken(${v});">ID${("000000000" + v).slice(-10)}</a>${(v == current_token_id) ? "<span>←</span>" : ""}</li>`).join("");
    const contents = `<p>Your owned token:</p><ul>${(tokens) ? tokens : "<p>nothing</p>"}</ul>`;
    $(".my-token-list").each((i, e) => {
        $(e).html(contents);
    });
};

const createCommand = () => {
    $("#createToken").on("click", () => {
        output("Please wait for application. It takes to get the result about a minute.");
        methods.createToken(user_account).send({from: user_account}).once("transactionHash", (hash) => {
            console.log(`The transaction hash is ${hash}.`);
        }).once("receipt", (result) => {
            console.log(result);
            current_token_id = result.event.Transfer.returnValues._tokenId;
            output("<p>You succeed in getting token."
            + "What you have to do after the completion is refreshing your token password.</p>");
        }).on("error", (error) => {
            console.error(error);
            output("Fail to apply.");
        });
    });

    $("#createToken2").on("click", () => {
        output("Please wait for application. It takes to get the result about a minute.");
        methods.createToken(user_account).send({from: user_account}).once("transactionHash", (hash) => {
            console.log(`The transaction hash is ${hash}.`);
        }).once("receipt", (result) => {
            console.log(result);
            current_token_id = result.event.Transfer.returnValues._tokenId;
            output("<p>You succeed in getting token."
            + "What you have to do after the completion is refreshing your token password.</p>");
        }).on("error", (error) => {
            console.error(error);
            output("Fail to apply.");
        });
    });

    $("#authorityOf").on("click", () => {
        const authority_id = $("#authority-id").val();
        methods.ownership(user_account).call().then((token_ids) => {
            console.log(token_ids);
            ownership_token_ids = token_ids;
            if (token_ids.length === 0) {
                output("You don't own any token.");
            } else if (token_ids.indexOf(current_token_id) > -1) {
                methods.authorityOf(current_token_id, authority_id).call().then((result) => {
                    console.log(result);
                    output(`You ${(result) ? "are" : "are not"} entitled to the authority No.${authority_id} .`);
                }, (error) => {
                    console.error(error);
                    output("Fail to get your authority.");
                });
            } else {
                console.log();
                output("You don't own the token to try to check its authority.");
            }
        });
    });

    $("#authorityOf2").on("click", () => {
        methods.ownership(user_account).call().then((token_ids) => {
            console.log(token_ids);
            ownership_token_ids = token_ids;
            if (token_ids.length === 0) {
                output("You don't own any token.");
            } else if (token_ids.indexOf(current_token_id) > -1) {
                methods.authorityOf(current_token_id, 1).call().then((result) => {
                    console.log(result);
                    const authority_id = 1;
                    output(`You ${(result) ? "are" : "are not"} entitled to the authority No.${authority_id} .`);
                }, (error) => {
                    console.error(error);
                    output("Fail to get your authority.");
                });
            } else {
                output("You don't own the token to try to check its authority.");
            }
        });
    });

    $("#authorityOfSubordinate2").on("click", () => {
        methods.authorityOf(2, 2).call().then((result) => {
            console.log(result);
            const authority_id = 2;
            output(`Your subordinate ${(result) ? "are" : "are not"} entitled to the authority No.${authority_id} .`);
        }, (error) => {
            console.error(error);
            output("Fail to get your subordinate's authority.");
        });
    });

    $("#deleteToken").on("click", () => {
        output('<div id="allAuthority"></div><div id="publicKey"></div>');
        methods.balanceOf(user_account).call().then((balance) => {
            console.log(balance);
            if (Number(balance) > 0) {
                output("Please wait for token deleted.");
                methods.deleteToken(current_token_id).send({from: user_account})
                .once("transactionHash", (hash) => {
                    console.log(`The transaction hash is ${hash}.`);
                }).on("receipt", (result) => {
                    console.log(result);
                    output("Succeed in removing your token.");
                }).on("error", (error) => {
                    console.error(error);
                    output("Fail to remove your token.");
                });
            } else if (Number(balance) === 0) {
                output("You don't own the token to try to remove.");
            } else {
                output("Your balance is invalid value.");
            }
        }, (error) => {
            console.error(error);
            output("Fail to get your balance.");
        });
    });

    $("#getTotalSupply").on("click", () => {
        methods.getTotalSupply().call().then((result) => {
            console.log(result);
            output(`The total supply of Manager Token is ${result} at present.`);
        }, (error) => {
            console.error(error);
            output("Fail to get the total supply.");
        });
    });

    $("#transfer").on("click", () => {
        const to_address = $("#to-address-input").val();
        console.log(to_address);
        if (to_address) {
            methods.ownership(user_account).call().then((token_ids) => {
                console.log(token_ids);
                ownership_token_ids = token_ids;
                if (token_ids.indexOf(current_token_id) > -1) {
                    output("Please wait for sending your token.");
                    methods.transfer(to_address, token_id).send({from: user_account})
                    .on("receipt", (result) => {
                        console.log(result);
                        output(`Succeed in sending your token to ${to_address}.`);
                    }).on("error", (error) => {
                        console.error(error);
                        output("Fail to send token.");
                    });
                }
            }, (error) => {
                console.error(error);
                output("You don't own the token to try to send.");
            });
        } else {
            output("Please fill in the destination address correctly.");
        }
    });

    $("#refreshPublicKey").on("click", () => {
        const password = $("#new-password-input").val();
        console.log(password);
        if (password.length > 0) {
            methods.ownership(user_account).call().then((token_ids) => {
                console.log(token_ids);
                ownership_token_ids = token_ids;
                if (token_ids.indexOf(current_token_id) > -1) {
                    output("Please wait for refreshing the token password.");
                    my_rsa_key = keyGen(password);
                    const n = my_rsa_key.n.toString();
                    const e = my_rsa_key.e;
                    methods.refreshPublicKey(current_token_id, n, e).send({from: user_account})
                    .once("transactionHash", (hash) => {
                        console.log(`The transaction hash is ${hash}.`);
                    }).once("receipt", (result) => {
                        console.log(result);
                        localStorage.setItem("RSAKey", stringifyRSAKey(my_rsa_key));
                        output("Succeed in refreshing the password");
                    }).on("error", (error) => {
                        console.error(error);
                        output("Fail to refresh the password.");
                    });
                }
            }, (error) => {
                console.error(error);
                output("You don't own the token to try to refresh the password.");
            });
        } else {
            output("Please fill in the token password correctly.");
        }
    });

    $("#refreshPublicKey2").on("click", () => {
        const password = $("#new-password-input2").val();
        console.log(password);
        if (password.length > 0) {
            methods.ownership(user_account).call().then((token_ids) => {
                console.log(token_ids);
                ownership_token_ids = token_ids;
                if (token_ids.indexOf(current_token_id) > -1) {
                    output("Please wait for refreshing the token password.");
                    my_rsa_key = keyGen(password);
                    const n = my_rsa_key.n.toString();
                    const e = my_rsa_key.e;
                    methods.refreshPublicKey(current_token_id, n, e).send({from: user_account})
                    .once("transactionHash", (hash) => {
                        console.log(`The transaction hash is ${hash}.`);
                    }).once("receipt", (result) => {
                        console.log(result);
                        localStorage.setItem("RSAKey", stringifyRSAKey(my_rsa_key));
                        output("Succeed in refreshing the password");
                    }).on("error", (error) => {
                        console.error(error);
                        output("Fail to refresh the password.");
                    });
                }
            }, (error) => {
                console.error(error);
                output("You don't own the token to try to refresh the password.");
            });
        } else {
            output("Please fill in the token password correctly.");
        }
    });

    $("#requestInfo").on("click", () => {
        methods.balanceOf(user_account).call().then((balance) => {
            console.log(balance);
            if (Number(balance) > 0) {
                const f = (res) => {
                    const signed_url = decrypto(JSON.parse(res).result);
                    console.log(signed_url);
                    window.open(signed_url);
                    output("Succeed in getting data. New window open and you can see its contents.");
                };
                const g = (error) => {
                    console.error(error);
                    output("Fail to get data.");
                };

                output("Please wait for getting data.");
                requestInfo(user_account)//.then(f, g);
            } else if (Number(balance) === 0) {
                output("You don't own any token.");
            } else {
                output("Please fill in the token password correctly.");
            }
        });
    });

    $("#requestInfo2").on("click", () => {
        methods.balanceOf(user_account).call().then((balance) => {
            console.log(balance);
            if (Number(balance) > 0) {
                const f = (res) => {
                    console.log(res);
                    const signed_url = decrypto(JSON.parse(res).result);
                    console.log(signed_url);
                    window.open(signed_url);
                    output("Succeed in getting data. New window open and you can see its contents.");
                };
                const g = (error) => {
                    console.error(error);
                    output("Fail to get data.");
                };

                output("Please wait for getting data.");
                requestInfo(user_account).then(f, g);
            } else if (Number(balance) === 0) {
                output("You don't own any token.");
            } else {
                output("Please fill in the token password correctly.");
            }
        });
    });

    $("#switchAuthority2").on("click", () => {
        if (current_token_id) {
            output("Please wait for changing authority.");
            methods.switchAuthority(current_token_id, 2, 2, true).send({from: user_account})
            .once("transactionHash", (hash) => {
                console.log(`The transaction hash is ${hash}.`);
            }).on("receipt", (result) => {
                console.log(result);
                output("Succeed in changing your subordinate's authority.");
            }).on("error", (error) => {
                console.log(error);
                output("You don't own the specific token.");
            });
        } else {
            output("Fail to execute. Don't you do according to the above procedure?");
        }
    });
};
/*
const requestInfo = (owner) => {
    const resource_name = "/requestinfo";
    const data = {
        token_id: current_token_id,
        name: "politics"
    };
    const header = {
        url: api_url + resource_name,
        type: "GET",
        dataType: "json",
        contentType: "application/json",
        crossDomain: true,
        cache: false,
        data: data
    };

    return $.ajax(header);
};
*/
const requestInfo = (d) => {

    const sign = signRSA("1".concat("0".repeat(200)));
    const req = {
        url: api_url2,
        method: "POST",
        crossDomain: true,
        cache: false,
        contentType: "application/json",
        dataType: "json",
        data: JSON.stringify({
            owner: current_token_id,
            sign: sign
        })
    };
    $.ajax(req).done(function(d){
      if(d){window.open(d);}else{alert("UNAUTHORIZED")};
    }).fail(function(d){console.log("fail");})
}

const parseRSAKey = (key_json) => {
    const key_obj = JSON.parse(key_json);
    return {
        coeff: new BigInteger(key_obj.coeff),
        d: new BigInteger(key_obj.d),
        dmp1: new BigInteger(key_obj.dmp1),
        dmq1: new BigInteger(key_obj.dmq1),
        e: key_obj.e,
        n: new BigInteger(key_obj.n),
        p: new BigInteger(key_obj.p),
        q: new BigInteger(key_obj.q)
    };
};

const stringifyRSAKey = (rsa_key) => JSON.stringify({
    coeff: rsa_key.coeff.toString(),
    d: rsa_key.d.toString(),
    dmp1: rsa_key.dmp1.toString(),
    dmq1: rsa_key.dmq1.toString(),
    e: rsa_key.e,
    n: rsa_key.n.toString(),
    p: rsa_key.p.toString(),
    q: rsa_key.q.toString()
});

const keyGen = (pass) => cryptico.generateRSAKey(pass, 1024);

const splitByLength = (str, length) => {
    let resultArr = [];
    if (!str || !length || length < 1) {
        return resultArr;
    }
    let index = 0;
    let end = str.length;
    let start = end - length;
    while (end > 0) {
        resultArr[index] = str.substring(start, end);
        index++;
        end = start;
        start = end - length;
    }
    return resultArr;
};

const decrypto = (encoded_url_list) => {
    if (my_rsa_key) {
        const d = my_rsa_key.d;
        const n = my_rsa_key.n;
        let result_url = "";
        encoded_url_list.forEach((url_segment) => {
            const m = new BigInteger(url_segment);
            const result_url_split = splitByLength(m.modPow(d, n).toString(), 4).map((char) => {
                return String.fromCharCode(Number(char));
            });
            let result = result_url_split.join("");
            result_url += result;
        });
        return result_url;
    } else {
        console.log("Don't find your private key.");
    }
};

const signRSA = (intd) => {
    if (my_rsa_key) {
        const d = my_rsa_key.d;
        const n = my_rsa_key.n;
        const m = new BigInteger(intd);
        return m.modPow(d, n).toString();
    } else {
        console.log("Could not find your private key.");
    }
};

$(() => {
    try {
        my_rsa_key = parseRSAKey(localStorage.getItem("RSAKey"));
    } catch (e) {
        console.log("Couldn't get RSA key.");
    }

    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== 'undefined') {
        // Use Mist/MetaMask's provider
        web3js = new Web3(web3.currentProvider);
    } else {
        web3js = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/"));;
    }

    const detectAccountChange = () => {
        web3js.eth.getAccounts((error, accounts) => {
            if (!error) {
                const account = accounts[0];
                if (account !== user_account) {
                    user_account = account;
                    methods.ownership(user_account).call().then((token_ids) => {
                        ownership_token_ids = token_ids;
                        current_token_id = (token_ids) ? token_ids[0] : NaN;
                        showMyTokens();
                    }, (error) => {
                        console.error(error);
                        output("Fail to get your tokens.");
                    });
                }
            } else {
                console.error(error);
                output("Don't designate your account address.");
            }
        });
    };

    detectAccountChange();
    setInterval(detectAccountChange, 3000);
    contract = new web3js.eth.Contract(contractABI, contractAddress);
    methods = contract.methods;
    createCommand();
});
