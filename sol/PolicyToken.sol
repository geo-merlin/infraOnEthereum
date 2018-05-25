pragma solidity ^0.4.24;

import "./ERC721.sol";
import "./safemath.sol";

contract PolicyToken is ERC721 {
    uint256 private totalSupply = 0;
    uint256 private tokenCount = 0;

    struct Authority {
        bool admin;
        bool holder;
        bool worker;
        string publicKeyN;
        string publicKeyE;
    }

    event HasAdminAuthority(address _owner);
    event HasHolderAuthority(address _owner);
    event HasWorkerAuthority(address _owner);
    event CreateToken(uint256 _tokenId);

    using SafeMath for uint256;

    mapping (uint256 => Authority) private allToken;

    ///  some valid owner address, even gen0 authoritys are created with a non-zero owner.
    mapping (uint256 => address) private indexToOwner;

    // @dev A mapping from owner address to count of tokens that address owns.
    //  Used internally inside balanceOf() to resolve ownership count.
    mapping (address => uint256) private ownershipTokenId;

    /// @dev A mapping from policyIDs to an address that has been approved to call
    ///  transferFrom(). Each policy can only have one approved address for transfer
    ///  at any time. A zero value means no approval is outstanding.
    mapping (uint256 => address) private indexToApproved;

    /// @notice Returns the number of Kitties owned by a specific address.
    /// @param _owner The owner address to check.
    /// @dev Required for ERC-721 compliance
    function balanceOf(address _owner) public view returns (uint256 balance) {
        balance = 0;
        if (ownershipTokenId[_owner] > 0) {
            balance = 1;
        }
    }

    function ownership(address _owner) public view returns (uint256 tokenId) {
        require(_owner != address(0));

        tokenId = ownershipTokenId[_owner];

        require(tokenId > 0);
    }

    /// @notice Returns the address currently assigned ownership of a given policy.
    /// @dev Required for ERC-721 compliance.
    function ownerOf(uint256 _tokenId) public view returns (address owner) {
        require(_tokenId > 0);

        owner = indexToOwner[_tokenId];

        require(owner != address(0));
    }

    function transfer(address _to, uint256 _tokenId) public {
        require(_to != address(0));
        require(_to != address(this));
        require(balanceOf(_to) == 0);
        require(ownerOf(_tokenId) == msg.sender);

        _transfer(msg.sender, _to, _tokenId);
    }

    function transferMyToken(address _to) public {
        uint256 tokenId = ownership(msg.sender);

        //require(tokenId > 0);

        transfer(_to, tokenId);
    }

    /// @notice Grant another address the right to transfer a specific policy via
    ///  transferFrom(). This is the preferred flow for transfering NFTs to contracts.
    /// @param _to The address to be granted transfer approval. Pass address(0) to
    ///  clear all approvals.
    /// @param _tokenId The ID of the policy that can be transferred if this call succeeds.
    /// @dev Required for ERC-721 compliance.
    function approve(address _to, uint256 _tokenId) public {
        require(_tokenId > 0);
        // Only an owner can grant transfer approval.
        require(_owns(msg.sender, _tokenId));

        // Register the approval (replacing any previous approval).
        _approve(_tokenId, _to);

        // Emit approval event.
        emit Approval(msg.sender, _to, _tokenId);
    }

    function takeOwnership(uint256 _tokenId) public {
        require(_tokenId > 0);
        require(_owns(msg.sender, _tokenId));

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

    //make sure that msg.sender allow to own token.
    function hasAdminAuthority(address _owner) internal returns (bool) {
        emit HasAdminAuthority(_owner);
        return true;
    }
    function hasHolderAuthority(address _owner) internal returns (bool) {
        emit HasHolderAuthority(_owner);
        return true;
    }
    function hasWorkerAuthority(address _owner) internal returns (bool) {
        emit HasWorkerAuthority(_owner);
        return true;
    }

    function createToken(
        string _publicKeyN,
        string _publicKeyE
    ) public returns (uint256) {
        require(bytes(_publicKeyN).length > 0);
        require(bytes(_publicKeyE).length > 0);
        require(balanceOf(msg.sender) == 0);
        bool adminAuthority = hasAdminAuthority(msg.sender);
        bool holderAuthority = hasHolderAuthority(msg.sender);
        bool workerAuthority = hasWorkerAuthority(msg.sender);

        tokenCount = tokenCount.add(1);
        totalSupply = totalSupply.add(1);
        ownershipTokenId[msg.sender] = tokenCount;
        indexToOwner[tokenCount] = msg.sender;
        allToken[tokenCount] = Authority({
            admin: adminAuthority,
            holder: holderAuthority,
            worker: workerAuthority,
            publicKeyN: _publicKeyN,
            publicKeyE: _publicKeyE
        });

        emit CreateToken(tokenCount);
        return tokenCount;
    }

    function _transfer(address _from, address _to, uint256 _tokenId) internal {
        // Since the number of policys is capped to 2^32 we can't overflow this
        ownershipTokenId[_to] = _tokenId;
        // transfer ownership
        indexToOwner[_tokenId] = _to;
        // When creating new policys _from is 0x0, but we can't account that address.
      if (_from != address(0)) {
          delete ownershipTokenId[_from];
          // clear any previously approved ownership exchange
          //delete indexToApproved[_tokenId];
      }

      emit Transfer(_from, _to, _tokenId);
    }

    // delete token
    function deleteToken() public {
        uint256 tokenId = ownership(msg.sender);

        //require(tokenId > 0);

        totalSupply = totalSupply.sub(1);
        delete allToken[tokenCount];
        delete ownershipTokenId[msg.sender];
        delete indexToOwner[tokenId];
    }

    // get token information.
    function checkAuthority(address _owner) public view returns (
        bool isAdmin,
        bool isHolder,
        bool isWorker,
        string publicKeyN,
        string publicKeyE
    ) {
        uint256 tokenId = ownership(_owner);

        //require(tokenId > 0);

        Authority memory tokenAuthority = allToken[tokenId];
        isAdmin = tokenAuthority.admin;
        isHolder = tokenAuthority.holder;
        isWorker = tokenAuthority.worker;
        publicKeyN = tokenAuthority.publicKeyN;
        publicKeyE = tokenAuthority.publicKeyE;
    }

    // change public key
    function keyReflesh(string _publicKeyN, string _publicKeyE) public {
        require(bytes(_publicKeyN).length > 0);
        require(bytes(_publicKeyE).length > 0);

        uint256 tokenId = ownership(msg.sender);

        //require(tokenId > 0);

        allToken[tokenId].publicKeyN = _publicKeyN;
        allToken[tokenId].publicKeyE = _publicKeyE;
    }
}
