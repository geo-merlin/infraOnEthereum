pragma solidity ^0.4.24;

contract MNGR {
    /** @notice Each of authority assigns 'authority ID'. **/

    /** @dev Required for ERC-721 compliance **/
    event Transfer(address indexed _from, address indexed _to, uint256 _tokenId);

    /** @dev Required for ERC-721 compliance **/
    event Approval(address indexed _owner, address indexed _approved, uint256 _tokenId);

    /** @dev Required for ERC-721 compliance **/
    function balanceOf(address _owner) public view returns (uint256 _balance);

    /** @dev Required for ERC-721 compliance **/
    function ownerOf(uint256 _tokenId) public view returns (address _owner);

    /** @dev Required for ERC-721 compliance **/
    function transfer(address _to, uint256 _tokenId) public;

    /** @dev Required for ERC-721 compliance **/
    function approve(address _to, uint256 _tokenId) public;

    /** @dev Required for ERC-721 compliance **/
    function takeOwnership(uint256 _tokenId) public;

    /** @dev Only the person owned the token called 'issuer' can execute this function. After calling,
        _approver own new token. The 'issuer' be the 'manager' of the token automatically. **/
    function createToken(address _approver) public returns (uint256);

    /** @dev Only the 'manager' of the token whose id equals _toTokenId (call 'toToken' below)
         can execute this function. The owner of the token whose id equals _fromTokenId (call 'fromToken' below)
         change the propriety that the _managerTokenId is included in managers of 'toToken' into _propriety. **/
    function switchManagers(uint256 _fromTokenId, uint256 _toTokenId, uint256 _managerTokenId, bool _propriety) public;

    /** @dev As switchManagers, _fromTokenId owner change the propriety that the _authorityId is
         included in authoritys of 'toToken' into _propriety.
         But this function caller must own the token with the _authorityId, in addition. **/
    function switchAuthority(uint256 _fromTokenId, uint256 _toTokenId, uint8 _authorityId, bool _propriety) public;

    /** @dev Change public key.
        @param _tokenId The ID of token to check.
        @param _nOfPublicKey The n part of RSA key.
        @param _eOfPublicKey The e part of RSA key. **/
    function refreshPublicKey(uint256 _tokenId, string _nOfPublicKey, uint256 _eOfPublicKey) public;

    /** @dev Only the token owner and issuer can execute this function. After calling,
         the token whose id equals _tokenId delete. **/
    function deleteToken(uint256 _tokenId) public;
}
