contract MultiContractInstance {
    uint a;
    function setA(uint t) returns (uint r){
    	a = t;
    	return a;
    }
}

contract MultiContractResolve {
	uint b;
	function setB(uint t) returns (uint r){
		b = t;
		return b;
	}
}