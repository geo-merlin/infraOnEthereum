pragma solidity ^0.4.24;

library AddressArrayUtils {
    /** @return Returns index and ok of the first occurrence starting from index 0. **/
    function index(address[] addresses, address a) internal pure returns (uint, bool) {
        for (uint i = 0; i < addresses.length; i++) {
            if (addresses[i] == a) {
                return (i, true);
            }
        }
        return (0, false);
    }

    function concat(address[] a, address[] b) internal pure returns (address[] memory c) {
        uint m = a.length;
        uint n = b.length;
        /// make sure of no overflow
        require(m + n > m);
        uint i = 0;
        uint j = 0;
        while (i < m) {
            c[i] = a[i++];
        }
        while (j < n) {
            c[i++] = b[j++];
        }
    }

    function extend(address[] storage a, address[] storage b) internal {
        uint m = a.length;
        uint n = b.length;
        /// make sure of no overflow
        require(m + n > m);
        uint i = 0;
        while (i < b.length) {
            a.push(b[i++]);
        }
    }

    /** @dev Reverses address array in place. **/
    function reverse(address[] storage a) internal returns (bool) {
        address t;
        for (uint i = 0; i < a.length / 2; i++) {
            t = a[i];
            a[i] = a[a.length - i - 1];
            a[a.length - i - 1] = t;
        }
        return true;
    }

}
