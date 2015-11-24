var primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67,
	71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163,
	167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269,
	271, 277, 281, 283, 293, 307, 311, 313, 317, 331, 337, 347, 349, 353, 359, 367, 373, 379, 383,
	389, 397, 401, 409, 419, 421, 431, 433, 439, 443, 449, 457, 461, 463, 467, 479, 487, 491, 499,
	503, 509, 521, 523, 541, 547, 557, 563, 569, 571, 577, 587, 593, 599, 601, 607, 613, 617, 619,
	631, 641, 643, 647, 653, 659, 661, 673, 677, 683, 691, 701, 709, 719, 727, 733, 739, 743, 751,
	757, 761, 769, 773, 787, 797, 809, 811, 821, 823, 827, 829, 839, 853, 857, 859, 863, 877, 881,
	883, 887, 907, 911, 919, 929, 937, 941, 947, 953, 967, 971, 977, 983, 991, 997
];

var mUsername = null;
var mP = null;
var mQ = null;
var mN = null;
var mPublicKey = null;
var mPrivateKey = null;
var mConnectedUserPublicKey = null;
var mConnectedUserN = null;


function createUser(username) {
	mUsername = username;
	mP = getRandomPrime();
	mQ = getRandomPrime();
	mN = mP * mQ;
	mPublicKey = getPublicKey(mP, mQ);
	mPrivateKey = getPrivateKey(mP, mQ, mPublicKey);
}

function onConnectedUser(connectedUserPublicKey, connectedUserN){
	mConnectedUserPublicKey = connectedUserPublicKey;
	mConnecdUserN = connectedUserN;
}

function sendMessage(message){
	var cypherMessage = cypher(mConnectedUserPublicKey, message, mConnectedUserN);
	var signature = getSignature(message);
	return [cypherMessage, signature];
}

function receiveMessage(cypherMessage, connectedUserSignature){
	var message = uncypher(cypherMessage, mPrivateKey, mN);
	var signature = invertedPowerMod(connectedUserSignature, mPrivateKey, mN); 
	return message;
}

function getSignature(username){
	var total = 0;
	for (var i = 0; i < username.length; i++) {
		total += parseInt(username[i].charCodeAt(0));
	};
	return powerMod(total, mConnectedUserPublicKey, mConnectedUserN);
}

function getRandomPrime() {
	return primes[Math.floor(Math.random() * primes.length)];
}

function getPublicKey(p, q) {
	var totem = getTotem(p, q);
	var eNumber = getENumber(totem);
	return eNumber;
}

function getPrivateKey(p, q, eNumber) {
	var totem = getTotem(p, q);
	var key = euclidesExtendedAlgorithm(totem, eNumber)[2];
	if (key < 0) {
		key = mod(key, totem);
	}
	return key;
}

function toAsciiArray(string) {
	var result = [];
	for (var i = 0; i < string.length; i++) {
		result.push(string[i].charCodeAt(0));
	};
	return result;
}

function mod(m, n) {
	return ((m % n) + n) % n;
}

function cypher(publicKey, string, n) {
	var asciiArray = toAsciiArray(string);
	var result = [];
	for (var i = 0; i < asciiArray.length; i++) {
		result.push(powerMod(asciiArray[i], publicKey, n));
	};
	return result;
}

function uncypher(cypherArray, privateKey, n) {

	var asciiArray = [];
	for (var i = 0; i < cypherArray.length; i++) {
		asciiArray.push(invertedPowerMod(cypherArray[i], privateKey, n));
	}

	var result = "";
	for (var i = 0; i < asciiArray.length; i++) {
		result += ascciToString(asciiArray[i]);
	};
	return result;
}

function invertedPowerMod(cypherElement, privateKey, n) {
	var binaryKey = decToBinary(privateKey);
	var z = 1;
	for (var i = 0; i < binaryKey.length; i++) {
		if (binaryKey[i] == 1) {
			z = (z * z) * cypherElement % n;
		} else {
			z = (z * z) % n;
		}
	};
	return z;
}

function powerMod(asciiLetter, publicKey, n) {
	var binaryKey = decToBinary(publicKey);
	var z = 1;
	for (var i = 0; i < binaryKey.length; i++) {
		if (binaryKey[i] == 1) {
			z = (z * z) * asciiLetter % n;
		} else {
			z = (z * z) % n;
		}
	};
	return z;
}

function decToBinary(string) {
	return parseInt(string, 10).toString(2)
}

function ascciToString(ascii) {
	return String.fromCharCode(ascii);
}

function getTotem(p, q) {
	return (p - 1) * (q - 1);
}

function getENumber(totem) {
	var prime = false;
	var number = -1;
	while (!prime) {
		number = Math.floor(Math.random() * totem) + 1;
		prime = isPrime(number);
	}
	return number;
}

function isPrime(n) {
	if (n < 2) return false;

	var q = Math.floor(Math.sqrt(n));

	for (var i = 2; i <= q; i++) {
		if (n % i == 0) {
			return false;
		}
	}
	return true;
}

function euclidesExtendedAlgorithm(a, b) {
	var q = Math.floor(Math.abs(a / b));
	if (b == 0) {
		return [a, 1, 0];
	} else {
		var lambda = euclidesExtendedAlgorithm(b, a % b);
		var dd = lambda[0];
		var dx = lambda[1];
		var dy = lambda[2];
		var values = [dd, dy, dx - q * dy];
		return values;
	}
}