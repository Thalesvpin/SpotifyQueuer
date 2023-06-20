


import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import {InputGroup, FormControl, Button} from 'react-bootstrap';
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
	const[searchInput, setSearchInput] = useState("");
	const[accessToken, setAccessToken] = useState("");
	// const[albums, setAlbums] = useState([]);
	const[tracks, setTracks] = useState([]);
	const [cor, setCor] = useState("");
	const [isLocked, setIsLocked] = useState(false);
	const [isClicked, setIsClicked] = useState(false);

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
				setAccessToken(data.access_token)
			})
	}, [])



	async function search(){
		console.log("Search for " + searchInput);
		console.log("access token response " + accessToken);


		// https://api.spotify.com/v1/search
		// 'q=' + pesquisa + '&type=track'
		// data.items.external_urls.spotify


		//GET request pra pegar id das musicas
		const searchParameters = {
			method: 'GET',
			headers: {
				'Content-Type' : 'application/json',
				'Authorization': 'Bearer ' + accessToken
			}
		}


//PESQUISA ALBUNS DO ARTISTA INSERIDO ===============================

		// var artistID = await fetch('https://api.spotify.com/v1/search?q=' + searchInput + '&type=artist', searchParameters)
		// 	.then(response => response.json())
		// 	.then(data => {return data.artists.items[0].id})

		// var returnedAlbums = await fetch('https://api.spotify.com/v1/artists/' + artistID + '/albums' + '?include_groups=album&market=BR&limit=50', searchParameters)
		// 	.then(response => response.json())
		// 	.then(data => setAlbums(data.items))

//=================================================================== aqui
	
		const trackID = await fetch('https://api.spotify.com/v1/search?q=' + searchInput + '&type=track&limit=50', searchParameters)
			.then(response => response.json())
			.then(data => {
				console.log(data);
				setTracks(data.tracks.items);
			})
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
		const trackID = await fetch('https://api.spotify.com/v1/me/player/queue?uri=' + trackUri, queueParameters)
			.then(response => response.json())
			.then(data => {
				console.log(data);
				setTracks(data.tracks.items);

			})
		
	}

	async function handleMusicSelection(trackUri){
		if(isLocked){
			return 1;
		}
		addToQueue(trackUri);
		setIsLocked(true);

		setIsClicked(true);

		createAlert(alert());
		setIsLocked(false);
		await delay(3000);
		removeAlert();
	}

	function createAlert(passInAlert){
		let createAlertElement = document.createElement("alert");
		createAlertElement.innerHTML = passInAlert;
		body.appendChild(createAlertElement);
	}

	const alert = () =>
		`
		<div class="alert">
			<div class="alert-content alert-success alert-header alert-container">
				<p class="alert-message">Música adicionada!</p>
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
			<div id="header" className=''>
				<img id="logo-img" className="logo" src={logo}></img>
				<div className='linha logo-txt'>
					<p className="font sptfy-green title">Queuer</p>
					<p className="font sptfy-green autor">By Thales</p>
				</div>
			</div>
			<div id="pesquisa" className="dark">
				<InputGroup className="mb3" size="lg">
					<FormControl
						placeholder="Buscar..."
						type="input"
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
			<div id="resultado" className="result mx-2 row row-cols-1 dark">
				{tracks.map( (track, i) => {
					return (
						<div id="card" className="cartao dark my-1 borda" onClick={() => handleMusicSelection(track.uri)} style={{ cursor: "pointer" }}>
							<img className="cartao linha cover py-1" src={track.album.images[0].url}></img>
							<p className="mx-2 my-0 linha songName">{track.name}</p>
						</div>
					)
				})}
			</div>
		</div>
	);
}

export default App;

