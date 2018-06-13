#### Attributions

```
mapping (uint8 => bool) authorityOf;
mapping (uint256 => bool) managersOf;
PublicKey publicKeyOf;
```

#### Functions

```
function createToken(address _approver) public;
function switchManagers(uint256 _fromTokenId, uint256 _toTokenId, uint256 _managerTokenId, bool _propriety) public;
function switchAuthority(uint256 _fromTokenId, uint256 _toTokenId, uint8 _authorityId, bool _propriety) public;
function refreshPublicKey(uint256 _tokenId, string _nOfPublicKey, uint256 _eOfPublicKey) public;
function deleteToken(uint256 _tokenId) public;
```

#### Additional Explain For Functions

* createToken - Only the person owned the token called 'issuer' can execute this function. After calling, \_approver own new token. The 'issuer' be the 'manager' of the token automatically.

* switchManagers - Only the 'manager' of the token whose id equals \_toTokenId (call 'toToken' below) can execute this function. The owner of the token whose id equals \_fromTokenId (call 'fromToken' below) change the propriety that the \_managerTokenId is included in managers of 'toToken' into \_propriety.

* switchAuthority - As switchManagers, \_fromTokenId owner change the propriety that the \_authorityId is included in authoritys of 'toToken' into \_propriety. But this function caller must own the token with the \_authorityId, in addition.

* refreshPublicKey - Only the token owner can execute this function. The owner resister the value equivalent to the 'n' and 'e' of RSA cryptosystems. By using these values, the owner allow someone to encrypto confidential data and anyone can decrypto the sign by the corresponded private key in advance.

* deleteToken - Only the token owner and issuer can execute this function. After calling, the token whose id equals \_tokenId delete.