var CreateDigits = function(str, shift){
	var arr = str.split("");
	var digits = [];
	var charCode = 0;
	var diff = shift || 1E2;

	for(var i = 0; i < arr.length; i++){
		charCode = str.charCodeAt(i) - diff;
		digits.push(charCode);
	}

	return digits;
};