pragma solidity ^0.4.24;

library Uint8ArrayUtils {
    function concat(uint8[] a, uint8[] b) internal pure returns (uint8[] memory c) {
        uint256 m = a.length;
        uint256 n = b.length;
        /// make sure of no overflow
        require(m + n > m);
        uint256 i = 0;
        uint256 j = 0;
        while (i < m) {
            c[i] = a[i++];
        }
        while (j < n) {
            c[i++] = b[j++];
        }
    }
}
