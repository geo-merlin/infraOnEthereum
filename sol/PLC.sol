pragma solidity ^0.4.24;

contract PLC is ERC721 {
    /// @notice Each of authority assigns 'authority ID'.

    /// @dev Change public key.
    /// @param _n The n part of RSA key.
    /// @param _e The e part of RSA key.
    function refleshPublicKey(string _n, string _e) public;

    /// @notice Returns token information.
    /// @param _tokenId The id of token to check.
    function checkAuthority(uint256 _tokenId) public view returns (
        uint8[] memory authorityIds,
        address[] memory admin,
        string n,
        string e
    );

    function changePolicy() public returns (bool success);
}
