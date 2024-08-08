


import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import {InputGroup, FormControl} from 'react-bootstrap';
import {useState, useEffect} from 'react';
import logo from "./imgs/logo.png";

// const CLIENT_ID = "28d80bad61ea4028bbd07381084d5beb";
// const CLIENT_SECRET = "e69ed4afd34341578d7f17e97f3fbc3a";
const CLIENT_AUTH = "MjhkODBiYWQ2MWVhNDAyOGJiZDA3MzgxMDg0ZDViZWI6ZTY5ZWQ0YWZkMzQzNDE1NzhkN2YxN2U5N2YzZmJjM2E=";
const REFRESH_TOKEN = "AQA-46a_erftWahtM8Rmu4iYAFZBzITDUza3rKYSjaB74btApWdBxaEpG-zfc4vWcsDIXVJAok8S2fBreovrCFMhc1e4rRmJsYSHEQkyycm8fZFqHz0HyBpcmgLiETyp3Io";

const body = document.querySelector("#root");

function delay(ms){
	return new Promise(resolve => 
		setTimeout(resolve, ms)
	);
};

function App(){
	const [searchInput, setSearchInput] = useState("");
	const [accessToken, setAccessToken] = useState("");
	const [tracks, setTracks] = useState([]);
	const [isLocked, setIsLocked] = useState(false);
	const [isListening, setIsListening] = useState(true);

	const [haveAtual, setHaveAtual] = useState('');


	const searchParameters = {
		method: 'GET',
		headers: {
			'Content-Type' : 'application/json',
			'Authorization': 'Bearer ' + accessToken
		}
	};

	useEffect(() => {
		console.log(CLIENT_AUTH.toString('base64'));

		//API Access Token
		var authParameters = {
			method: 'POST',
			headers: {
				'Authorization': 'Basic ' + CLIENT_AUTH,
				'Content-Type' : 'application/x-www-form-urlencoded'
			},
			// body: 'grant_type=client_credentials'
			body: 'grant_type=refresh_token&refresh_token=' + REFRESH_TOKEN
			// json: true
			// body: 'grant_type=client_credentials&client_id=' + CLIENT_ID + '&client_secret=' + CLIENT_SECRET
		}
		fetch('https://accounts.spotify.com/api/token', authParameters)
			.then(result => result.json())
			.then(data => {
				setAccessToken(data.access_token);
				console.log(`accessToken: Bearer ${data.access_token}`)
			})
	}, [])



	// queue()

	// const queue = () => {}

	// arrow function to use useEffect (useEffect serve pra ficar de olho em algo que possa ser mudado)

	async function getQueue(){
		clearSearchBar();

		let queueHeader = document.createElement('div');
		queueHeader.id = "queueHeader";
		queueHeader.className = "alnL mx-2 row row-cols-1";

		await fetch('https://api.spotify.com/v1/me/player/queue', searchParameters)
			.then(response => response.json())
			.then(data => {
				setIsLocked(true);
				if(data.currently_playing == null){
					setIsListening(false);
					setTracks([]);
				}
				else{
					setTracks(data.queue);
					setHaveAtual(data.currently_playing);
					removeCurrentSongCard();
					setIsListening(true);
				}
			})

	}

	function clearSearchBar(){
		if(searchInput !== ""){
			const searchBar = document.querySelector("#search-bar");
			searchBar.value = "";
			setSearchInput("");
		}
	}

	function removeCurrentSongCard(){
		let fila = document.querySelector("#queueHeader");
		if(fila != null){
			fila.remove();
		}	
	}

	async function search(){
		console.log("Search for " + searchInput);
		console.log("access token response " + accessToken);

		setIsListening(true)

		setIsLocked(false);

		// removeCurrentSongCard();
		setHaveAtual(false);

		// https://api.spotify.com/v1/search
		// 'q=' + pesquisa + '&type=track'
		// data.items.external_urls.spotify


		//GET request pra pegar id das musicas
		// const searchParameters = {
		// 	method: 'GET',
		// 	headers: {
		// 		'Content-Type' : 'application/json',
		// 		'Authorization': 'Bearer ' + accessToken
		// 	}
		// }


//PESQUISA ALBUNS DO ARTISTA INSERIDO ===============================

		// var artistID = await fetch('https://api.spotify.com/v1/search?q=' + searchInput + '&type=artist', searchParameters)
		// 	.then(response => response.json())
		// 	.then(data => {return data.artists.items[0].id})

		// var returnedAlbums = await fetch('https://api.spotify.com/v1/artists/' + artistID + '/albums' + '?include_groups=album&market=BR&limit=50', searchParameters)
		// 	.then(response => response.json())
		// 	.then(data => setAlbums(data.items))

//=================================================================== aqui
	
		await fetch('https://api.spotify.com/v1/search?q=' + searchInput + '&type=track&limit=50', searchParameters)
			.then(response => response.json())
			.then(data => {
				console.log(data);
				setTracks(data.tracks.items);
			})
		
		clearSearchBar();
	}

	async function addToQueue(trackUri){
		const queueParameters = {
			method: 'POST',
			headers: {
				'Accept':  'application/json',
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + accessToken
			}
		}
		await fetch('https://api.spotify.com/v1/me/player/queue?uri=' + trackUri, queueParameters)
			.then(response => {
				console.log(response.status);
				if(response.status === 204 || response.status === 200){
					createAlert(songAddedAlert());
				}
				else{
					createAlert(userNotListeningAlert());				
				}
			})
	}

	async function handleMusicSelection(trackUri){
		if(isLocked){
			return 1;
		}
		addToQueue(trackUri);
		setIsLocked(true);

		await delay(500);
		setIsLocked(false);
		await delay(2500);
		removeAlert();
	}

	function createAlert(passInAlert){
		let createAlertElement = document.createElement("alert");
		createAlertElement.innerHTML = passInAlert;
		body.appendChild(createAlertElement);
	}

	const songAddedAlert = () =>
		`
		<div class="alert">
			<div class="alert-content alert-success alert-header alert-container">
				<p class="alert-msg success">Música adicionada!</p>
			</div>
		</div>
		`
	;

	const userNotListeningAlert = () =>
		`
		<div class="alert">
			<div class="alert-content alert-error alert-header alert-container">
				<p class="alert-msg error">Música não adicionada!</p>
			</div>
		</div>
		`
	;
	
	function removeAlert(){
		const newAlert = document.querySelector("alert");
		newAlert.remove();
	}

	return(
		<div id="geral" className="geral App dark">
			<title>Spotify Queuer</title>
			<div id="header" className=''>
				<img id="logo-img" className="logo" src={logo} alt=""></img>
				<div className='linha logo-txt-cont'>
					<p className="font sptfy-green title logo-txt">Queuer</p>
					<p className="font sptfy-green autor logo-txt">By Thales P.</p>
				</div>
			</div>
			<div id="pesquisa" className="dark">
				<button className="btn btn-success btn-fila" onClick={getQueue}>
					Fila
				</button>
				<InputGroup className="mb3" size="lg">
					<FormControl
						id="search-bar"
						placeholder="Buscar..."
						type="text"
						onKeyPress={event => {
							if(event.key === "Enter"){
								search();
							}
						}}
						onChange={event => setSearchInput(event.target.value)}
					/>
					<button className="btn btn-success" onClick={search}>
						Buscar
					</button>
				</InputGroup>
			</div>
			<div id="resultado" className="alnL mx-2 row row-cols-1 dark">
				{haveAtual && (
						
						<>
						<p id="emRep"> Em reprodução </p>
						<div id="card" className="cartao dark my-1 borda">
							<img className="cartao linha cover py-1" src={haveAtual.album.images[0].url} alt="song album"></img>
							<p className="mx-2 my-0 linha songName">{haveAtual.name}</p>
						</div>
						<p id="next"> A seguir </p>
						</>	
					)
				}

				{!isListening && (
					<>
					<div className="notListening">
						<p>Thales não está ouvindo nada no momento!</p>
						<p>Tente novamente mais tarde.</p>
					</div>
					</>	
					)
				}

				{tracks.map( (track, i) => {
					return (
						<div id="card" className="cartao dark my-1 borda" onClick={() => handleMusicSelection(track.uri)} style={{ cursor: "pointer" }}>
							<img className="cartao linha cover py-1" src={track.album.images[0].url} alt="song album"></img>
							<p className="mx-2 my-0 linha songName">{track.name}</p>
						</div>
					)
				})}
			</div>
		</div>
	);
}

export default App;

