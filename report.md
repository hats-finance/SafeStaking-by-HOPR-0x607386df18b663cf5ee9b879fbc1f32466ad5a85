# **SafeStaking by HOPR Audit Competition on Hats.finance** 


## Introduction to Hats.finance


Hats.finance builds autonomous security infrastructure for integration with major DeFi protocols to secure users' assets. 
It aims to be the decentralized choice for Web3 security, offering proactive security mechanisms like decentralized audit competitions and bug bounties. 
The protocol facilitates audit competitions to quickly secure smart contracts by having auditors compete, thereby reducing auditing costs and accelerating submissions. 
This aligns with their mission of fostering a robust, secure, and scalable Web3 ecosystem through decentralized security solutions​.

## About Hats Audit Competition


Hats Audit Competitions offer a unique and decentralized approach to enhancing the security of web3 projects. Leveraging the large collective expertise of hundreds of skilled auditors, these competitions foster a proactive bug hunting environment to fortify projects before their launch. Unlike traditional security assessments, Hats Audit Competitions operate on a time-based and results-driven model, ensuring that only successful auditors are rewarded for their contributions. This pay-for-results ethos not only allocates budgets more efficiently by paying exclusively for identified vulnerabilities but also retains funds if no issues are discovered. With a streamlined evaluation process, Hats prioritizes quality over quantity by rewarding the first submitter of a vulnerability, thus eliminating duplicate efforts and attracting top talent in web3 auditing. The process embodies Hats Finance's commitment to reducing fees, maintaining project control, and promoting high-quality security assessments, setting a new standard for decentralized security in the web3 space​​.

## SafeStaking by HOPR Overview

SafeStaking by HOPR is a new tool for securing staked crypto-assets on Ethereum and EVM-compatible chains

## Competition Details


- Type: A public audit competition hosted by SafeStaking by HOPR
- Duration: 2 weeks
- Maximum Reward: $1,000,000,000,000,000,000
- Submissions: 59
- Total Payout: $253,333,000,000,000,030 distributed among 9 participants.

## Scope of Audit

HOPR is a mixnet protocol where all nodes are incentived to relay packets by means of the novel Proof of Relay mechanism. SafeStaking by HOPR is a permissioning module for Safe that allows for tight control of monetary flows and permission management. SafeStaking by HOPR is designed to allow for highly automated node running while minimizing risk if the node is compromised.

The higher-level goals of the staking design are: (1) to decouple fund management from node operation; (2) to allow co-signing transactions for higher security; and (3) to reduce the impact of compromised nodes on user funds.

In brief, authorization of various actions is split amont three private keys. Through this separation of concerns, each private key has only a single area of functionality, which is distinct from the other keys.
This reduces the surface area of attacks and makes general recovery of the entire staking account easier.

Full explanations can be found in the documentation.

## Medium severity issues


- **Potential Safe Compromise Through Malicious Module Injection in NodeStakeFactory**

  The issue is about a vulnerability in `Safe` that could be compromised by a malicious actor using a front-running attack. The actor can inject a malicious module into the `Safe` setup where he could steal user funds and perform unauthorized actions. Additionally, the attacker can inject his address as one of the admin addresses to take control. The user might use the malicious `Safe` unknowingly, risking their funds. The flaw exists due to a lack of validation for the `moduleSingletonAddress` in `NodeStakeFactory` - `clone()`. The evidence is supported with a proof of concept. The suggested mitigation proposes updating `clone()` to disallow arbitrary module address input, instead using a storage variable for `moduleSingletonAddress` initialized during the `NodeStakeFactory.sol` constructor.


  **Link**: [Issue #22](https://github.com/hats-finance/SafeStaking-by-HOPR-0x607386df18b663cf5ee9b879fbc1f32466ad5a85/issues/22)


- **Issue with Registering/Deregistering Safes having Multiple Modules in NodeSafeRegistry**

  An issue was found in the way 'Safes' with multiple modules are registered or deregistered in 'NodeSafeRegistry'. A particular function called `ensureNodeIsSafeModuleMember()` is used to ensure `HoprNodeManagementModule` is an enabled module of the 'Safe'. However, when this function loops through all the modules, it calls `isHoprNodeManagementModule()` and `isNode()` functions, which can cause a revert as other modules may not implement these functions. Another problem is that a malicious module can pose as a `HoprNodeManagementModule` by simply implementing these functions and return 'true' on function calls, potentially allowing false registrations or deregistrations. A proof of concept has been provided to reproduce the issue.


  **Link**: [Issue #23](https://github.com/hats-finance/SafeStaking-by-HOPR-0x607386df18b663cf5ee9b879fbc1f32466ad5a85/issues/23)


- **Misconstrued Time Units in HoprChannels and HoprLedger Contracts**

  The issue pertains to the calculation of `TWENTY_FOUR_HOURS` in two contracts: `HoprChannels` and `HoprLedger` inside the Blockchain network EVM. In the contract `HoprChannels`, it is identified that `TWENTY_FOUR_HOURS` is calculated in milliseconds while the EVM timestamp operates in seconds. In the `HoprLedger` contract, the `snapshotInterval` is mistakenly defined with a value representing 24000 hours, leading to inaccurate updates of the `latestSnapshotRoot`. The recommended solution to this discrepancy is to calculate the `TWENTY_FOUR_HOURS` in seconds instead of milliseconds to align with the EVM's operation. This adjustment needs to be applied in both `HoprChannels` and `HoprLedger` contracts to ensure accurate time calculation.


  **Link**: [Issue #31](https://github.com/hats-finance/SafeStaking-by-HOPR-0x607386df18b663cf5ee9b879fbc1f32466ad5a85/issues/31)

## Low severity issues


- **Missing Storage Gap in SimplifiedModule May Overwrite Multisend Variable**

  The `HoprNodeManagementModule`, a child module of `SimplifiedModule`, lacks a defined storage gap. This issue could cause the `address public multisend;` variable to be overwritten if an upgrade to `SimplifiedModule` introduces a new variable, compromising the protocol's integrity. It is suggested to add an appropriate storage gap at the end of `SimplifiedModule`, following OpenZeppelin's recommendation.


  **Link**: [Issue #15](https://github.com/hats-finance/SafeStaking-by-HOPR-0x607386df18b663cf5ee9b879fbc1f32466ad5a85/issues/15)


- **Miscalculations in Contract Operations Due to Incorrect Use of Time Units**

  The issue discusses potential miscalculations in contracts due to the use of general arithmetic operations for defining time variables. It recommends using solidity time units to avoid such mistakes. The example given is revising "24 * 60 * 60 * 1000 milliseconds" to "1 days * 1000 milliseconds", for defining twenty-four hours.


  **Link**: [Issue #34](https://github.com/hats-finance/SafeStaking-by-HOPR-0x607386df18b663cf5ee9b879fbc1f32466ad5a85/issues/34)


- **Constructor Doesn't Validate Address; Can Set To Zero Accidentally**

  The issue arises from the lack of an address(0) check in the constructor which could accidentally set the address to 0x00 and lead to the loss of administrative role-based functions. The proposed solution includes adding a Check-Effect-Interactions (CEIs) standard that ensures the address is not zero in the 'Announcements.sol' and 'Channels.sol' files.


  **Link**: [Issue #35](https://github.com/hats-finance/SafeStaking-by-HOPR-0x607386df18b663cf5ee9b879fbc1f32466ad5a85/issues/35)


- **Constructor Issue: No Check for Zero Value Before Contract Deployment**

  The issue pertains to a constructor not checking for zero value, potentially allowing a contract to be deployed without setting the required value. This could complicate snapshot capture. The proposed solution suggests adding a check to verify that the input value is not zero when deploying the contract.


  **Link**: [Issue #36](https://github.com/hats-finance/SafeStaking-by-HOPR-0x607386df18b663cf5ee9b879fbc1f32466ad5a85/issues/36)



## Conclusion

The audit report of Hats.finance highlights the security of web3 projects through decentralized audit competitions by SafeStaking by HOPR, which allows for healthy competition among auditors, prioritizing the quality of audits while reducing costs. The competition model pays only for detected vulnerabilities, promoting efficiency and higher quality work. The report also offers an overview of SafeStaking by HOPR, a tool meant for securing staked crypto-assets. However, the audit revealed various security issues, such as potential safe compromises through malicious module injections and issues with registering/deregistering 'Safes.' There were also problems with miscalculated time units and missing storage gap in contract operations. Solutions were proposed, including updating contract calculations and adding safety checks. These measures will further enhance the robustness and security of the protocol, while reducing potential vulnerabilities.

## Disclaimer


This report does not assert that the audited contracts are completely secure. Continuous review and comprehensive testing are advised before deploying critical smart contracts./n/n
The SafeStaking by HOPR audit competition illustrates the collaborative effort in identifying and rectifying potential vulnerabilities, enhancing the overall security and functionality of the platform.


Hats.finance does not provide any guarantee or warranty regarding the security of this project. All smart contract software should be used at the sole risk and responsibility of users.

