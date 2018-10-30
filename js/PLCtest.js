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
                output(`
                    <p>トークンが削除されるのを待機しています。</p>
                    <p>この表示がいつまでも変化しない場合は、 MetaMask を開いて
                    トランザクションを承認しているか確認してください。</p>
                    <p>また、トランザクションが取り込まれるまでに時間がかかっている可能性があります。</p>
                `);
                deleteToken().on("receipt", (result) => {
                    console.log(result);
                    output(`トークンの削除に成功しました。`);
                }).on("error", (error) => {
                    output(`
                        <p>トークンの削除をキャンセルしたか、削除時にエラーが生じました。</p>
                        <p color="red">${error}</p>
                    `);
                });
            } else if (Number(balance) === 0) {
                output(`あなたはまだトークンを持っていないので、トークンを削除することはできません。`);
            } else {
                output(`
                    <p>残高が不明な値です。</p>
                    <p>この表示が出た場合、システムにエラーが生じている可能性があります。</p>
                `);
            }
        }, (error) => {
            output(`
                <p>残高の取得に失敗しました。</p>
                <p color="red">${error}</p>
            `);
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
            output(`ただいまのトークン総発行数は ${result}枚です。`);
        }, (error) => {
            output(`
                <p>総発行量の取得に失敗しました。</p>
                <p color="red">${error}</p>
            `);
        });
    });

    $("#transfer").on("click", () => {
        const to_address = $("#to-address-input").val();
        console.log(to_address);
        if (!to_address) {
            output(`
                <p>宛先を入力してください。</p>
                <p>トークン送信ボタンの横の空欄に宛先の Ethereum アドレスを入力しましたか？</p>
            `);
            return;
        }
        if (!web3.isAddress(to_address)) {
            output(`
                <p>宛先を正確に入力してください。</p>
                <p>入力したものは本当に Ethereum のアドレスですか？</p>
                <p>アドレスには 0x が含まれていますか？</p>
                <p>アドレスの前後に " などの余計な記号は含まれていませんか？</p>
            `);
            return;
        }
        if (to_address === user_account) {
            output(`送信先のアドレスを自分にすることはできません。`);
            return;
        }
        ownership(user_account).then((token_id) => {
            console.log(token_id);
            balanceOf(to_address).then((balance) => {
                if (Number(balance) !== 0) {
                    output(`
                        <p>送信先のアドレスはすでにトークンを持っています。</p>
                        <p>1つのアカウントで複数のトークンを所持することはできません。</p>
                    `);
                    return;
                }
                output(`
                    <p>トークンが送金されるのを待機しています。</p>
                    <p>この表示がいつまでも変化しない場合は、 MetaMask を開いて
                    トランザクションを承認しているか確認してください。</p>
                    <p>また、トランザクションが取り込まれるまでに時間がかかっている可能性があります。</p>
                `);
                transfer(to_address, token_id).on("receipt", (result) => {
                    console.log(result);
                    output(`トークンを ${to_address} に送金しました。`);
                }).on("error", (error) => {
                    output(`
                        <p>トークンの送金をキャンセルしたか、送金時にエラーが生じました。</p>
                        <p color="red">${error}</p>
                    `);
                });
            }, (error) => {
                output(`送信先のアドレスの残高の取得に失敗しました。`);
            });
        }, (error) => {
            output(`あなたはトークンを持っていないので、トークンを送信することはできません。`);
        });
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
                    output(`
                        <p>パスワードが変更されるのを待機しています。</p>
                        <p>この表示がいつまでも変化しない場合は、 MetaMask を開いて
                        トランザクションを承認しているか確認してください。</p>
                        <p>また、トランザクションが取り込まれるまでに時間がかかっている可能性があります。</p>
                    `);
                    keyGen(password);
                    const n = myRSAKey.n.toString();
                    const e = String(myRSAKey.e);
                    if (old_n === n && old_e === e) {
                        output(`以前と同じパスワードだったので、秘密鍵が復元されました。`);
                        return;
                    }
                    keyReflesh(n, e).on("receipt", (result) => {
                        console.log(result);
                        localStorage.setItem("RSAKey", stringifyRSAKey(myRSAKey));
                        output(`パスワードを変更しました。`);
                    }).on("error", (error) => {
                        output(`
                            <p>パスワードの変更をキャンセルしたか、変更時にエラーが生じました。</p>
                            <p color="red">${error}</p>
                        `);
                    });
                });
            }, (error) => {
                output(`あなたはトークンを持っていないので、パスワードの変更をすることはできません。`);
            });
        } else {
            output(`
                <p>パスワードを入力してください。</p>
                <p>トークン送信ボタンの横の空欄にパスワードを入力しましたか？</p>
            `);
        }
    });

    $("#requestInfoA").on("click", () => {
        requestInfoInterface("A.pdf");
    });

    $("#requestInfoB").on("click", () => {
        requestInfoInterface("B.pdf");
    });

    $("#requestInfo").on("click", () => {
        requestInfoInterface("salon.pdf");
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
        if (error) {
            output(`
                <p>アカウントの取得時にエラーが生じました。</p>
                <p color="red">${error}</p>
            `);
            return;
        }
        console.log(accounts);
        if (accounts.length === 0) {
            output(`
                <p>アカウントが指定されていません。</p>
                <p>MetaMaskを起動していますか？</p>
            `);
            return;
        }
        window.user_account = accounts[0];
        createCommand();
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
    if (password.length === 0) {
        output(`
            <p>パスワードを入力してください。</p>
            <p>トークン送信ボタンの横の空欄にパスワードを入力しましたか？</p>
        `);
        return;
    }
    balanceOf(user_account).then((balance) => {
        console.log(balance);
        if (Number(balance) === 0) {
            output(`
                <p>トークンが作成されるのを待機しています。</p>
                <p>この表示がいつまでも変化しない場合は、 MetaMask を開いて
                トランザクションを承認しているか確認してください。</p>
                <p>また、トランザクションが取り込まれるまでに時間がかかっている可能性があります。</p>
            `);
            keyGen(password);
            const n = myRSAKey.n.toString();
            const e = String(myRSAKey.e);
            createToken(n, e).on("receipt", (result) => {
                console.log(result);
                localStorage.setItem("RSAKey", stringifyRSAKey(myRSAKey));
                output(`
                    <p>トークンが発行されました。</p>
                    <p>このトークンを所持している限り、
                    レポートの閲覧権限を持ちます。</p>
                `);
            }).on("error", (error) => {
                output(`
                    <p>トークンの作成をキャンセルしたか、作成時にエラーが生じました。</p>
                    <p color="red">${error}</p>
                `);
            });
        } else if (Number(balance) > 0) {
            output(`
                <p>あなたはすでにトークンを持っています。</p>
                <p>1つのアカウントで複数のトークンを所持することはできません。</p>
            `);
        } else {
            output(`
                <p>残高が不明な値です。</p>
                <p>この表示が出た場合、システムにエラーが生じている可能性があります。</p>
            `);
        }
    }, (error) => {
        output(`
            <p>残高の取得に失敗しました。</p>
            <p color="red">${error}</p>
        `);
    });
};

const checkAuthorityInterface = () => {
    balanceOf(user_account).then((balance) => {
        console.log(balance);
        if (Number(balance) > 0) {
            checkAuthority(user_account).then((authority) => {
                console.log(authority);
                output(`<p>あなたはレポートを見る権限をもっていま${authority.isHolder ? "す" : "せん"}。`);
            }, (error) => {
                output(`
                    <p>トークン情報の取得に失敗しました。</p>
                    <p color="red">${error}</p>
                `);
            });
        } else if (Number(balance) === 0) {
            output(`あなたはまだトークンを持っていません。`);
        } else {
            output(`
                <p>残高が不明な値です。</p>
                <p>この表示が出た場合、システムにエラーが生じている可能性があります。</p>
            `);
        }
    }, (error) => {
        output(`
            <p>残高の取得に失敗しました。</p>
            <p color="red">${error}</p>
        `);
    });
};

const requestInfoInterface = (file_name) => {
    output("残高を取得しています。");
    balanceOf(user_account).then((balance) => {
        console.log(balance);
        if (Number(balance) > 0) {
            output(`暗号化されたデータを解読中です。`);
            requestInfo(user_account, file_name);
        } else if (Number(balance) === 0) {
            output("あなたはまだトークンを持っていません。");
        } else {
            output(`
                <p>残高が不明な値です。</p>
                <p>この表示が出た場合、システムにエラーが生じている可能性があります。</p>
            `);
        }
    });
};

function requestInfo(owner, file_name) {
    const sign = signRSA();
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
            output(`
                <p>権限を確認できませんでした。</p>
                <p>トークンを持っていないと、レポートを見ることはできません。</p>
            `);
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

const decrypt = (m_list) => {
    if (!window.myRSAKey) {
        output(`
            <p>RSAキーが取得できませんでした。</p>
            <p>パスワードの再設定を行ってください。前回と同じもので構いません。</p>
        `);
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

function signRSA() {
    const intd = "1".concat("0".repeat(200));
    if (!window.myRSAKey) {
        output(`
            <p>RSAキーが取得できませんでした。</p>
            <p>パスワードの再設定を行ってください。前回と同じもので構いません。</p>
        `);
    }
    const d = myRSAKey.d;
    const n = myRSAKey.n;
    const m = new BigInteger(intd);
    // console.log(m.toString(), d.toString(), n.toString());
    return m.modPow(d, n).toString();
}
