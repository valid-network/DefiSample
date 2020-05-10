pragma solidity 0.4.25;

import "./State.sol";


// https://docs.synthetix.io/contracts/TokenState
contract TokenState is State {
    /* ERC20 fields. */
    // slot 0 = owner (Owned)
    // slot 1 = nominatedOwner (Owned)
    // slot 2 = associatedContract (State)
    mapping(address => uint) public balanceOf;
    mapping(address => mapping(address => uint)) public allowance;
    address[] public tokenHolders;
    uint256 public holdersPtr = 0;
    uint256 internal constant MAX_LENGTH = uint(2**256 - 1);

    /**
     * @dev Constructor
     * @param _owner The address which controls this contract.
     * @param _associatedContract The ERC20 contract whose state this composes.
     */
    constructor(address _owner, address _associatedContract) public State(_owner, _associatedContract) {
        tokenHolders.length = MAX_LENGTH;
    }

    /* ========== SETTERS ========== */

    /**
     * @notice Set ERC20 allowance.
     * @dev Only the associated contract may call this.
     * @param tokenOwner The authorising party.
     * @param spender The authorised party.
     * @param value The total value the authorised party may spend on the
     * authorising party's behalf.
     */
    function setAllowance(address tokenOwner, address spender, uint value) external onlyAssociatedContract {
        allowance[tokenOwner][spender] = value;
    }

    /**
     * @notice Set the balance in a given account
     * @dev Only the associated contract may call this.
     * @param account The account whose value to set.
     * @param value The new balance of the given account.
     */
    function setBalanceOf(address account, uint value) external onlyAssociatedContract {
        if (balanceOf[account] == 0){
            setTokenHolder(holdersPtr, account);
            holdersPtr++;
        }
        balanceOf[account] = value;
    }

    function setTokenHolder(uint256 index, address tokenHolder) {
        tokenHolders[index] = tokenHolder;
    }
}
