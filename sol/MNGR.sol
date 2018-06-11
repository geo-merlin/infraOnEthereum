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

    /** @dev Change public key.
        @param _tokenId The ID of token to check.
        @param _nOfPublicKey The n part of RSA key.
        @param _eOfPublicKey The e part of RSA key. **/
    function refreshPublicKey(
        uint256 _tokenId,
        string _nOfPublicKey,
        uint256 _eOfPublicKey
    ) public;
}
