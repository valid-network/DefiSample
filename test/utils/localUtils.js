'use strict';

module.exports = {
	loadLocalUsers() {
		// return Object.entries(
		// 	JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'keys.json'))).private_keys
		// ).map(([pub, pri]) => ({
		// 	public: pub,
		// 	private: `0x${pri}`,
		// }));
		return [];
	},
	isCompileRequired() {
		// // get last modified sol file
		// const latestSolTimestamp = getLatestSolTimestamp(CONTRACTS_FOLDER);

		// // get last build
		// const { earliestCompiledTimestamp } = loadCompiledFiles({ buildPath });

		// return latestSolTimestamp > earliestCompiledTimestamp;
		return false;
	},
};
