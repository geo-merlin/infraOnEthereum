pragma solidity ^0.4.24;

import "./ERC721.sol";
import "./ownable.sol";
import "./safemath.sol";
import "./uint8ArrayUtils.sol";
import "./addressArrayUtils.sol";

contract PLC is ERC721, Ownable {
    using SafeMath256 for uint256;
    using Uint8ArrayUtils for uint8[];
    using AddressArrayUtils for address[];

    /** @notice A couple of public key. **/
    struct PublicKey {
        string n;
        uint256 e;
    }

    /** @notice A set of authority. **/
    struct Policy {
        // the strength of authority
        uint8[] authority;
        // administers of the token
        address[] administers;
        // public key
        PublicKey publicKey;
    }

    /** @dev Make sure that somebody have the token whose ID is _tokenId. **/
    modifier validToken(uint256 _tokenId) {
        require(_tokenId > 0);
        require(indexToOwner[_tokenId] != address(0));
        _;
    }

    /** @dev Make sure that _holder has the token whose ID is _tokenId. **/
    modifier owns(address _holder, uint256 _tokenId) {
        require(_tokenId > 0);
        require(_owns(_holder, _tokenId));
        _;
    }

    /** @dev Make sure that _holder has some tokens. **/
    modifier holdToken(address _holder) {
        require(_holder != address(0));
        require(ownership(_holder).length > 0);
        _;
    }

    /** @dev Make sure that a specific address is administer of a specific token.
        @param _admin The owner address to check.
        @param _tokenId The ID of the token to check. **/
    modifier editable(address _admin, uint256 _tokenId) {
        uint256 index;
        bool success;
        (index, success) = allToken[_tokenId].administers.index(_admin);
        require(success == true);
        _;
    }

    event Create(address _holder, uint256 _tokenId);
    event Delete(address _holder, uint256 _tokenId);

    uint256 private totalSupply = 0;
    uint256 private tokenCount = 0;
    address public manager;

    mapping (uint256 => Policy) private allToken;

    // some valid owner address, even gen0 authoritys are created with a non-zero owner.
    mapping (uint256 => address) public indexToOwner;

    /// @dev A mapping from owner address to count of tokens that address owns.
    ///  Used internally inside balanceOf() to resolve ownership count.
    mapping (address => uint256) public ownershipTokenCount;

    /// @dev A mapping from policyIDs to an address that has been approved to call
    ///  transferFrom(). Each policy can only have one approved address for transfer
    ///  at any time. A zero value means no approval is outstanding.
    mapping (uint256 => address) public indexToApproved;

    // mapping (string => uint256) public authorityIndex;
    // mapping (uint256 => string) public authorityName;

    constructor() public {
        manager = msg.sender;
    }

    /** @notice Returns the number of tokens owned by a specific address.
        @param _owner The owner address to check.
        @dev Required for ERC-721 compliance. **/
    function balanceOf(address _owner) public view returns (uint256) {
        return ownership(_owner).length;
    }

    /// @notice Returns the address currently assigned ownership of a given policy.
    /// @dev Required for ERC-721 compliance.
    function ownerOf(uint256 _tokenId) public view validToken(_tokenId) returns (address) {
        return indexToOwner[_tokenId];
    }

    function ownership(address _holder) public view returns(uint256[]) {
        require(_holder != address(0));
        uint256[] memory result = new uint256[](ownershipTokenCount[_holder]);
        uint256 counter = 0;
        for (uint256 i = 1; i <= tokenCount; i++) {
            if (indexToOwner[i] == _holder) {
                result[counter] = i;
                counter++;
            }
        }
        return result;
    }

    function transfer(address _to, uint256 _tokenId) public owns(msg.sender, _tokenId) {
        require(_to != address(0));
        require(_to != address(this));
        require(balanceOf(_to) == 0);
        require(_owns(msg.sender, _tokenId));

        _transfer(msg.sender, _to, _tokenId);
    }

    /** @notice Grant another address the right to transfer a specific policy via
         transferFrom(). This is the preferred flow for transfering NFTs to contracts.
        @param _to The address to be granted transfer approval. Pass address(0) to
         clear all approvals.
        @param _tokenId The ID of the policy that can be transferred if this call succeeds.
        @dev Required for ERC-721 compliance. **/
    function approve(address _to, uint256 _tokenId) public owns(msg.sender, _tokenId) {
        // Register the approval (replacing any previous approval).
        _approve(_tokenId, _to);

        // Emit approval event.
        emit Approval(msg.sender, _to, _tokenId);
    }

    function takeOwnership(uint256 _tokenId) public owns(msg.sender, _tokenId) {
        address owner = ownerOf(_tokenId);

        _transfer(owner, msg.sender, _tokenId);
    }

    function getTotalSupply() public view returns (uint256) {
        return totalSupply;
    }

    /// @dev Checks if a given address currently has transferApproval for a particular policy.
    /// @param _claimant the address we are confirming policy is approved for.
    /// @param _tokenId policy id, only valid when > 0
    function _approvedFor(address _claimant, uint256 _tokenId) internal view returns (bool) {
        return indexToApproved[_tokenId] == _claimant;
    }

    /// @dev Checks if a given address is the current owner of a particular policy.
    /// @param _claimant the address we are validating against.
    /// @param _tokenId policy id, only valid when > 0
    function _owns(address _claimant, uint256 _tokenId) internal view returns (bool) {
        return indexToOwner[_tokenId] == _claimant;
    }

    /// @dev Marks an address as being approved for transferFrom(), overwriting any previous
    ///  approval. Setting _approved to address(0) clears all transfer approval.
    ///  NOTE: _approve() does NOT send the Approval event. This is intentional because
    ///  _approve() and transferFrom() are used together for putting Kitties on auction, and
    ///  there is no value in spamming the log with Approval events in that case.
    function _approve(uint256 _tokenId, address _approved) internal {
        indexToApproved[_tokenId] = _approved;
    }

    function createToken(
        address _approver,
        uint8[] memory _authority,
        address[] memory _administers
    ) public onlyOwner returns (uint256 tokenId) {
        //request(_administers.index(msg.sender)[1] == false);

        tokenCount = tokenCount.add(1);
        totalSupply = totalSupply.add(1);
        ownershipTokenCount[_approver] = ownershipTokenCount[_approver].add(1);
        indexToOwner[tokenCount] = _approver;
        tokenId = tokenCount;

        string memory nOfPublicKey = "";
        uint256 eOfPublicKey = 0;
        address[] memory addressMe = new address[](1);
        addressMe[0] = msg.sender;
        address[] memory administers = _administers.concat(addressMe);
        PublicKey memory publicKey = PublicKey({
            n: nOfPublicKey,
            e: eOfPublicKey
        });

        allToken[tokenCount] = Policy({
            authority: _authority,
            administers: administers,
            publicKey: publicKey
        });

        emit Create(_approver, tokenCount);
    }

    function _transfer(address _from, address _to, uint256 _tokenId) internal {
        // Since the number of policys is capped to 2^32 we can't overflow this
        ownershipTokenCount[_to] = ownershipTokenCount[_to].add(1);
        // transfer ownership
        indexToOwner[_tokenId] = _to;
        // When creating new policys _from is 0x0, but we can't account that address.
        if (_from != address(0)) {
          ownershipTokenCount[_from] = ownershipTokenCount[_from].sub(1);
          // clear any previously approved ownership exchange
          delete indexToApproved[_tokenId];
        }

        emit Transfer(_from, _to, _tokenId);
    }

    // delete token
    function deleteToken(uint256 _tokenId) public owns(msg.sender, _tokenId) returns (bool success) {
        totalSupply = totalSupply.sub(1);
        //delete allToken[_tokenId];
        ownershipTokenCount[msg.sender] = ownershipTokenCount[msg.sender].sub(1);
        delete indexToOwner[_tokenId];
        success = true;
        emit Delete(msg.sender, _tokenId);
    }

    function addAdminister(
        uint256 _tokenId,
        address[] _administers
    ) public validToken(_tokenId) editable(msg.sender, _tokenId) returns (bool success) {
        allToken[tokenCount].administers = allToken[tokenCount].administers.concat(_administers);
        success = true;
    }

    function changeAdminister(
        uint256 _tokenId,
        address[] _administers
    ) public validToken(_tokenId) editable(msg.sender, _tokenId) returns (bool success) {
        allToken[tokenCount].administers = _administers;
        success = true;
    }

    function addAuthority(
        uint256 _tokenId,
        uint8[] memory _authority
    ) public validToken(_tokenId) editable(msg.sender, _tokenId) returns (bool success) {
        allToken[tokenCount].authority = allToken[tokenCount].authority.concat(_authority);
        success = true;
    }

    function changeAuthority(
        uint256 _tokenId,
        uint8[] memory _authority
    ) public validToken(_tokenId) editable(msg.sender, _tokenId) returns (bool success) {
        allToken[tokenCount].authority = _authority;
        success = true;
    }

    // get token information.
    function checkAuthority(uint256 _tokenId) public view validToken(_tokenId) returns (
        uint8[] memory authority
    ) {
        Policy memory token = allToken[_tokenId];
        authority = token.authority;
    }

    function checkAdministers(uint256 _tokenId) public view validToken(_tokenId) returns (
        address[] memory administers
    ) {
        Policy memory token = allToken[_tokenId];
        administers = token.administers;
    }

    function checkPublicKey(uint256 _tokenId) public view validToken(_tokenId) returns (
        string n,
        uint256 e
    ) {
        Policy memory token = allToken[_tokenId];
        PublicKey memory publicKey = token.publicKey;
        n = publicKey.n;
        e = publicKey.e;
    }

    // change public key
    function refleshPublicKey(
        uint256 _tokenId,
        string _nOfPublicKey,
        uint256 _eOfPublicKey
    ) public validToken(_tokenId) returns (bool success) {
        require(bytes(_nOfPublicKey).length > 0);
        require(_eOfPublicKey > 0);
        require(_owns(msg.sender, _tokenId));

        allToken[_tokenId].publicKey.n = _nOfPublicKey;
        allToken[_tokenId].publicKey.e = _eOfPublicKey;
        success = true;
    }
}
