pragma solidity ^0.4.24;

import "./MNGR.sol";
import "./safemath.sol";

contract ManagerToken is MNGR {
    using SafeMath for uint256;

    /** @notice A couple of public key. **/
    struct PublicKey {
        string n;
        uint256 e;
    }

    /** @notice Total supply, which means the number of vaild tokens, initialize by 0. **/
    uint256 private totalSupply;
    /** @notice Total count, which means the call count of 'createToken' function, initialize by 0. **/
    uint256 private tokenCount;
    /** @notice Issuer token ID assign 1 of uint256 in constructor. **/
    uint256 public issuerTokenId;

    mapping (uint256 => mapping (uint8 => bool)) public authorityOf;
    mapping (uint256 => mapping (uint256 => bool)) public managersOf;
    mapping (uint256 => PublicKey) public publicKeyOf;
    mapping (uint256 => address) public indexToOwner;

    /** @dev A mapping from holder address to count of tokens that address owns.
         Used internally inside balanceOf() to resolve ownership count. **/
    mapping (address => uint256) public ownershipTokenCount;

    /** @dev A mapping from token IDs to an address that has been approved to call
         transferFrom(). Each token can only have one approved address for transfer
         at any time. A zero value means no approval is outstanding. **/
    mapping (uint256 => address) public indexToApproved;

    /** @dev Make sure that somebody have the token whose ID is _tokenId. **/
    modifier validToken(uint256 _tokenId) {
        require(indexToOwner[_tokenId] != address(0));
        _;
    }

    /** @dev Make sure that _holder has the token whose ID is _tokenId. **/
    modifier owns(address _holder, uint256 _tokenId) {
        require(_tokenId > 0);
        require(indexToOwner[_tokenId] == _holder);
        _;
    }

    /** @dev Make sure that _holder has some tokens. **/
    modifier holdToken(address _holder) {
        require(_holder != address(0));
        require(ownership(_holder).length > 0);
        _;
    }

    /** @dev Make sure that a specific address is administer of a specific token.
        @param _claimant The manager address to check.
        @param _tokenId The ID of the token to check. **/
    modifier editable(uint256 _claimant, uint256 _tokenId) {
        require(managersOf[_tokenId][_claimant] == true);
        _;
    }

    modifier grantable(uint256 _claimant, uint8[] memory _authorityIds) {
        for (uint256 i = 0; i < _authorityIds.length; i++) {
            require(authorityOf[_claimant][_authorityIds[i]] == true);
        }
        _;
    }

    modifier onlyIssuer() {
        require(indexToOwner[issuerTokenId] == msg.sender);
        _;
    }

    event LogCreateToken(address _holder, uint256 _tokenId);
    event LogDeleteToken(address _holder, uint256 _tokenId);
    event LogChangeManagers(uint256 _tokenId, uint256 _managerTokenId, bool _propriety);
    event LogChangeAuthority(uint256 _tokenId, uint256 _authorityId, bool _propriety);
    event LogChangePublicKey(uint256 _tokenId, string _nOfPublicKey, uint256 _eOfPublicKey);

    constructor() public {
        issuerTokenId = 1;
        _createToken(msg.sender);
    }

    function getTotalSupply() public view returns (uint256) {
        return totalSupply;
    }

    /** @notice Returns the number of tokens owned by a specific address.
        @param _owner The holder address to check.
        @dev Required for ERC-721 compliance. **/
    function balanceOf(address _owner) public view returns (uint256 _balance) {
        _balance = ownershipTokenCount[_owner];
    }

    /** @notice Returns the address currently assigned ownership of a given policy.
        @dev Required for ERC-721 compliance. **/
    function ownerOf(uint256 _tokenId) public view validToken(_tokenId) returns (address _owner) {
        _owner = indexToOwner[_tokenId];
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

        _transfer(msg.sender, _to, _tokenId);
    }

    function approve(address _to, uint256 _tokenId) public owns(msg.sender, _tokenId) {
        // Register the approval (replacing any previous approval).
        _approve(_tokenId, _to);

        // Emit approval event.
        emit Approval(msg.sender, _to, _tokenId);
    }

    function _approve(uint256 _tokenId, address _approved) private {
        indexToApproved[_tokenId] = _approved;
    }

    /** @dev Checks if a given address currently has transferApproval for a particular policy.
        @param _claimant the address we are confirming policy is approved for.
        @param _tokenId policy id, only valid when > 0 **/
    function _approvedFor(address _claimant, uint256 _tokenId) private view returns (bool) {
        return indexToApproved[_tokenId] == _claimant;
    }

    function takeOwnership(uint256 _tokenId) public {
        require(_tokenId > 0);
        require(_approvedFor(msg.sender, _tokenId));

        address holder = ownerOf(_tokenId);

        _transfer(holder, msg.sender, _tokenId);
    }

    /** @dev Create token. **/
    function createToken(address _approver) public onlyIssuer returns (uint256) {
        // @notice Anyone have not owned the token whose id equals 'tokenCount'.
        //require(indexToOwner[tokenCount.add(1)] == address(0));

        return _createToken(_approver);
    }

    function _createToken(address _approver) private returns (uint256) {
        tokenCount = tokenCount.add(1);
        totalSupply = totalSupply.add(1);
        managersOf[tokenCount][issuerTokenId] = true;

        _transfer(0x0, _approver, tokenCount);

        return tokenCount;
    }

    function _transfer(address _from, address _to, uint256 _tokenId) private {
        ownershipTokenCount[_to] = ownershipTokenCount[_to].add(1);
        indexToOwner[_tokenId] = _to;
        // When creating new tokens, '_from' is 0x0.
        if (_from != address(0)) {
            ownershipTokenCount[_from] = ownershipTokenCount[_from].sub(1);
            // clear any previously approved ownership exchange
            delete indexToApproved[_tokenId];
        }

        emit Transfer(_from, _to, _tokenId);
    }

    /** @dev Delete token. **/
    function deleteToken(uint256 _tokenId) public owns(msg.sender, _tokenId) {
        require(_tokenId != issuerTokenId);
        totalSupply = totalSupply.sub(1);
        /*delete authorityOf[_tokenId];
        delete managersOf[_tokenId];
        delete publicKeyOf[_tokenId];*/
        ownershipTokenCount[msg.sender] = ownershipTokenCount[msg.sender].sub(1);
        delete indexToOwner[_tokenId];

        emit LogDeleteToken(msg.sender, _tokenId);
    }

    function switchManagers(
        uint256 _fromTokenId,
        uint256 _toTokenId,
        uint256 _managerTokenId,
        bool _propriety
    ) public owns(msg.sender, _fromTokenId) validToken(_toTokenId) editable(_fromTokenId, _toTokenId) {
        managersOf[_toTokenId][_managerTokenId] = _propriety;

        emit LogChangeManagers(_toTokenId, _managerTokenId, _propriety);
    }

    function addManagers(
        uint256 _fromTokenId,
        uint256 _toTokenId,
        uint256[] _managerTokenIds
    ) external {
        for (uint256 i = 0; i < _managerTokenIds.length; i++) {
            switchManagers(_fromTokenId, _toTokenId, _managerTokenIds[i], true);
        }
    }

    function removeManagers(
        uint256 _fromTokenId,
        uint256 _toTokenId,
        uint256[] _managerTokenIds
    ) external {
        for (uint256 i = 0; i < _managerTokenIds.length; i++) {
            switchManagers(_fromTokenId, _toTokenId, _managerTokenIds[i], false);
        }
    }

    function switchAuthority(
        uint256 _fromTokenId,
        uint256 _toTokenId,
        uint8 _authorityId,
        bool _propriety
    ) public owns(msg.sender, _fromTokenId) validToken(_toTokenId)/* editable(_fromTokenId, _toTokenId)*/ {
        //require(authorityOf[_fromTokenId][_authorityId] == true);
        authorityOf[_toTokenId][_authorityId] = _propriety;

        emit LogChangeAuthority(_toTokenId, _authorityId, _propriety);
    }

    function addAuthority(
        uint256 _fromTokenId,
        uint256 _toTokenId,
        uint8[] _authorityIds
    ) external {
        for (uint256 i = 0; i < _authorityIds.length; i++) {
            switchAuthority(_fromTokenId, _toTokenId, _authorityIds[i], true);
        }
    }

    function removeAuthority(
        uint256 _fromTokenId,
        uint256 _toTokenId,
        uint8[] _authorityIds
    ) external {
        for (uint256 i = 0; i < _authorityIds.length; i++) {
            switchAuthority(_fromTokenId, _toTokenId, _authorityIds[i], false);
        }
    }

    /** @dev Change public key. **/
    function refreshPublicKey(
        uint256 _tokenId,
        string _nOfPublicKey,
        uint256 _eOfPublicKey
    ) public owns(msg.sender, _tokenId) {
        require(bytes(_nOfPublicKey).length > 0);
        require(_eOfPublicKey > 0);

        publicKeyOf[_tokenId].n = _nOfPublicKey;
        publicKeyOf[_tokenId].e = _eOfPublicKey;

        emit LogChangePublicKey(_tokenId, _nOfPublicKey, _eOfPublicKey);
    }
}
