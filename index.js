let web3;
let contract;
let currentAccount;
const contractAddress = '0x36D8A46e35a7EbF0acCa6096DC0762e060a25b44';
const contractABI = [
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "content",
				"type": "string"
			}
		],
		"name": "MessageSent",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_username",
				"type": "string"
			}
		],
		"name": "register",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_to",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "_content",
				"type": "string"
			}
		],
		"name": "sendMessage",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getMessages",
		"outputs": [
			{
				"components": [
					{
						"internalType": "address",
						"name": "sender",
						"type": "address"
					},
					{
						"internalType": "string",
						"name": "content",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "timestamp",
						"type": "uint256"
					}
				],
				"internalType": "struct ChatApp.Message[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "messages",
		"outputs": [
			{
				"internalType": "address",
				"name": "sender",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "content",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "users",
		"outputs": [
			{
				"internalType": "bool",
				"name": "exists",
				"type": "bool"
			},
			{
				"internalType": "string",
				"name": "username",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

async function init() {
    if (typeof window.ethereum !== 'undefined') {
        web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        currentAccount = await web3.eth.getCoinbase();
        contract = new web3.eth.Contract(contractABI, contractAddress);

        document.getElementById('register-btn').addEventListener('click', registerUser);
        document.getElementById('send-btn').addEventListener('click', sendMessage);
        document.getElementById('logout-btn').addEventListener('click', logout);
    } else {
        alert('Please install MetaMask!');
    }
}

async function registerUser() {
    const username = document.getElementById('username').value;

    if (username) {
        await contract.methods.register(username).send({ from: currentAccount });
        alert('User registered successfully!');
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('chat-section').style.display = 'block';
        loadMessages();
        document.getElementById('logout-btn').style.display = 'block';
    } else {
        alert('Please enter a username!');
    }
}

async function sendMessage() {
    const receiver = document.getElementById('receiver').value;
    const message = document.getElementById('message').value;

    if (receiver && message) {
        // Send the message through the contract
        await contract.methods.sendMessage(receiver, message).send({ from: currentAccount });

        // Clear the input field
        document.getElementById('message').value = '';

        // Create a message element for the sent message
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', 'sent'); // Use 'sent' class for styling
        messageElement.innerText = `${currentAccount}: ${message} (at ${new Date().toLocaleString()})`;

        // Append the message to the messages div
        const messagesDiv = document.getElementById('messages');
        messagesDiv.appendChild(messageElement);

        // Scroll to the bottom of the messages
        messagesDiv.scrollTop = messagesDiv.scrollHeight;

        // Load messages from the blockchain (optional, to refresh with new messages)
        loadMessages();
    } else {
        alert('Please enter both receiver and message!');
    }
}


async function loadMessages() {
    const messages = await contract.methods.getMessages().call({ from: currentAccount });
    const messagesDiv = document.getElementById('messages');
    messagesDiv.innerHTML = ''; // Clear existing messages

    messages.forEach(msg => {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.classList.add(msg.sender.toLowerCase() === currentAccount.toLowerCase() ? 'sent' : 'received'); // Add class based on sender
        messageElement.innerText = `${msg.sender}: ${msg.content} (at ${new Date(msg.timestamp * 1000).toLocaleString()})`;
        messagesDiv.appendChild(messageElement);
    });

    // Scroll to the bottom of the messages
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function logout() {
    document.getElementById('login-section').style.display = 'block';
    document.getElementById('chat-section').style.display = 'none';
    document.getElementById('logout-btn').style.display = 'none';
    document.getElementById('username').value = '';
}

window.addEventListener('load', init);
