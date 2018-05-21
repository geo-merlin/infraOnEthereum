pragma solidity ^0.4.23;

contract ERC721 {
    // Required methods
    //function totalSupply() public view returns (uint256 total);
    function balanceOf(address _owner) public view returns (uint256 balance);
    function ownerOf(uint256 _tokenId) external view returns (address owner);
    function approve(address _to, uint256 _tokenId) external;
    function transfer(address _to, uint256 _tokenId) external;
    function transferFrom(address _from, address _to, uint256 _tokenId) external;

    // Events
    event Transfer(address from, address to, uint256 tokenId);
    event Approval(address owner, address approved, uint256 tokenId);

    // ERC-165 Compatibility (https://github.com/ethereum/EIPs/issues/165)
    //function supportsInterface(bytes4 _interfaceID) external view returns (bool);
}

contract PolicyToken is ERC721 {
    uint256 public totalSupply = 0;
    uint256 public tokenCount = 0;
    mapping (uint256 => Authority) public allToken;

    ///  some valid owner address, even gen0 authoritys are created with a non-zero owner.
    mapping (uint256 => address) public indexToOwner;

    // @dev A mapping from owner address to count of tokens that address owns.
    //  Used internally inside balanceOf() to resolve ownership count.
    mapping (address => uint256) public ownershipTokenID;

    /// @dev A mapping from policyIDs to an address that has been approved to call
    ///  transferFrom(). Each policy can only have one approved address for transfer
    ///  at any time. A zero value means no approval is outstanding.
    mapping (uint256 => address) public policyIndexToApproved;

    /// @notice Returns the number of Kitties owned by a specific address.
    /// @param _owner The owner address to check.
    /// @dev Required for ERC-721 compliance
    function balanceOf(address _owner) public view returns (uint256) {
        uint256 count = 0;
        if (ownershipTokenID[_owner] > 0) {
            count = 1;
        }
        return count;
    }

    /// @notice Returns the address currently assigned ownership of a given policy.
    /// @dev Required for ERC-721 compliance.
    function ownerOf(uint256 _tokenId)
        external
        view
        returns (address owner)
    {
        owner = indexToOwner[_tokenId];

        require(owner != address(0));
    }

    function transfer(
        address _to,
        uint256 _tokenId
    )
        external
    {
        // Safety check to prevent against an unexpected 0x0 default.
        require(_to != address(0));
        // Disallow transfers to this contract to prevent accidental misuse.
        // The contract should never own any kitties (except very briefly
        // after a gen0 authority is created and before it goes on auction).
        require(_to != address(this));
        // Disallow transfers to the auction contracts to prevent accidental
        // misuse. Auction contracts should only take ownership of kitties
        // through the allow + transferFrom flow.
        //require(_to != address(saleAuction));
        //require(_to != address(siringAuction));

        // You can only send your own authority.
        require(_owns(msg.sender, _tokenId));

        require(ownershipTokenID[_to] == 0);

        // Reassign ownership, clear pending approvals, emit Transfer event.
        transferToken(msg.sender, _to, _tokenId);
    }

    /// @dev Checks if a given address currently has transferApproval for a particular policy.
    /// @param _claimant the address we are confirming kitten is approved for.
    /// @param _tokenId kitten id, only valid when > 0
    function _approvedFor(address _claimant, uint256 _tokenId) internal view returns (bool) {
        return policyIndexToApproved[_tokenId] == _claimant;
    }

    /// @dev Checks if a given address is the current owner of a particular policy.
    /// @param _claimant the address we are validating against.
    /// @param _tokenId kitten id, only valid when > 0
    function _owns(address _claimant, uint256 _tokenId) internal view returns (bool) {
        return indexToOwner[_tokenId] == _claimant;
    }

    /// @notice Transfer a policy owned by another address, for which the calling address
    ///  has previously been granted transfer approval by the owner.
    /// @param _from The address that owns the policy to be transfered.
    /// @param _to The address that should take ownership of the policy. Can be any address,
    ///  including the caller.
    /// @param _tokenId The ID of the policy to be transferred.
    /// @dev Required for ERC-721 compliance.
    function transferFrom(
        address _from,
        address _to,
        uint256 _tokenId
    )
        external
    {
        // Safety check to prevent against an unexpected 0x0 default.
        require(_to != address(0));
        // Disallow transfers to this contract to prevent accidental misuse.
        // The contract should never own any kitties (except very briefly
        // after a gen0 authority is created and before it goes on auction).
        require(_to != address(this));
        // Check for approval and valid ownership
        require(_approvedFor(msg.sender, _tokenId));
        require(_owns(_from, _tokenId));

        require(ownershipTokenID[_to] == 0);

        // Reassign ownership (also clears pending approvals and emits Transfer event).
        transferToken(_from, _to, _tokenId);
    }

    /// @dev Marks an address as being approved for transferFrom(), overwriting any previous
    ///  approval. Setting _approved to address(0) clears all transfer approval.
    ///  NOTE: _approve() does NOT send the Approval event. This is intentional because
    ///  _approve() and transferFrom() are used together for putting Kitties on auction, and
    ///  there is no value in spamming the log with Approval events in that case.
    function _approve(uint256 _tokenId, address _approved) internal {
        policyIndexToApproved[_tokenId] = _approved;
    }

    /// @notice Grant another address the right to transfer a specific policy via
    ///  transferFrom(). This is the preferred flow for transfering NFTs to contracts.
    /// @param _to The address to be granted transfer approval. Pass address(0) to
    ///  clear all approvals.
    /// @param _tokenId The ID of the policy that can be transferred if this call succeeds.
    /// @dev Required for ERC-721 compliance.
    function approve(
        address _to,
        uint256 _tokenId
    )
        external
    {
        // Only an owner can grant transfer approval.
        require(_owns(msg.sender, _tokenId));

        // Register the approval (replacing any previous approval).
        _approve(_tokenId, _to);

        // Emit approval event.
        emit Approval(msg.sender, _to, _tokenId);
    }

    event CreateToken(uint256 tokenID);

    struct Authority {
        bool admin;
        bool holder;
        bool worker;
        string publicKey;
    }

    event HasAdminAuthority(address _owner);
    event HasHolderAuthority(address _owner);
    event HasWorkerAuthority(address _owner);

    //make sure that msg.sender allow to own token.
    function hasAdminAuthority(address _owner) public returns (bool) {
        emit HasAdminAuthority(_owner);
        return true;
    }
    function hasHolderAuthority(address _owner) public returns (bool) {
        emit HasHolderAuthority(_owner);
        return true;
    }
    function hasWorkerAuthority(address _owner) public returns (bool) {
        emit HasWorkerAuthority(_owner);
        return true;
    }

    function createToken(
        bool _adminAuthority,
        bool _holderAuthority,
        bool _workerAuthority,
        string _seed
    ) public returns (uint256) {
        require(ownershipTokenID[msg.sender] == 0);
        require(tokenCount + 1 > tokenCount);
        require(totalSupply + 1 > totalSupply);
        if (_adminAuthority) {
            require(hasAdminAuthority(msg.sender));
        }
        if (_holderAuthority) {
            require(hasHolderAuthority(msg.sender));
        }
        if (_workerAuthority) {
            require(hasWorkerAuthority(msg.sender));
        }

        tokenCount++;
        totalSupply++;
        ownershipTokenID[msg.sender] = tokenCount;
        indexToOwner[tokenCount] = msg.sender;
        allToken[tokenCount] = Authority({
            admin: _adminAuthority,
            holder: _holderAuthority,
            worker: _workerAuthority,
            publicKey: _seed
        });

        emit CreateToken(tokenCount);
        return tokenCount;
    }

    function transferToken(address _from, address _to, uint256 _tokenID) internal {
        // Since the number of kittens is capped to 2^32 we can't overflow this
        ownershipTokenID[_to] = _tokenID;
        // transfer ownership
        indexToOwner[_tokenID] = _to;
        // When creating new kittens _from is 0x0, but we can't account that address.
        if (_from != address(0)) {
            delete ownershipTokenID[_from];
            // clear any previously approved ownership exchange
            //delete policyIndexToApproved[_tokenId];
        }
        // Emit the transfer event.
        emit Transfer(_from, _to, _tokenID);
    }

    function deleteToken(uint _tokenID) public {
        require(totalSupply > 0);
        require(ownershipTokenID[msg.sender] > 0);
        delete allToken[tokenCount];
        totalSupply--;
        delete ownershipTokenID[msg.sender];
        delete indexToOwner[_tokenID];
    }

    // get token information.
    function checkAdminAuthority(address _owner) public view returns (bool) {
        require(ownershipTokenID[_owner] > 0);
        return allToken[ownershipTokenID[_owner]].admin;
    }
    function checkHolderAuthority(address _owner) public view returns (bool) {
        require(ownershipTokenID[_owner] > 0);
        return allToken[ownershipTokenID[_owner]].holder;
    }
    function checkWorkerAuthority(address _owner) public view returns (bool) {
        require(ownershipTokenID[_owner] > 0);
        return allToken[ownershipTokenID[_owner]].worker;
    }

    function keyReflesh(string _public_key, uint _tokenID) public returns (string) {
        require(indexToOwner[_tokenID] == msg.sender);
        allToken[_tokenID].publicKey = _public_key;
        return _seed;
    }

    /// @notice Returns the total number of Kitties currently in existence.
    /// @dev Required for ERC-721 compliance.
    //function totalSupply() public view returns (uint) {
        //return kitties.length - 1;
    //}

    /// @notice Introspection interface as per ERC-165 (https://github.com/ethereum/EIPs/issues/165).
    ///  Returns true for any standardized interfaces implemented by this contract. We implement
    ///  ERC-165 (obviously!) and ERC-721.
    /* function supportsInterface(bytes4 _interfaceID) external view returns (bool)
    {
        // DEBUG ONLY
        //require((InterfaceSignature_ERC165 == 0x01ffc9a7) && (InterfaceSignature_ERC721 == 0x9a20483d));

        return ((_interfaceID == InterfaceSignature_ERC165) || (_interfaceID == InterfaceSignature_ERC721));
    } */
}