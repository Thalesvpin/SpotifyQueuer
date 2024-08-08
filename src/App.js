


import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import {InputGroup, FormControl} from 'react-bootstrap';
import {useState, useEffect} from 'react';
import logo from "./imgs/logo.png";

// require('dotenv').config();

const CLIENT_AUTH = process.env.REACT_APP_CLIENT_AUTH;
const REFRESH_TOKEN = process.env.REACT_APP_REFRESH_TOKEN;

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

	const [hasCurrent, setHasCurrent] = useState('');


	const searchParameters = {
		method: 'GET',
		headers: {
			'Content-Type' : 'application/json',
			'Authorization': 'Bearer ' + accessToken
		}
	};

	useEffect(() => {
		//API Access Token
		var authParameters = {
			method: 'POST',
			headers: {
				'Authorization': 'Basic ' + CLIENT_AUTH,
				'Content-Type' : 'application/x-www-form-urlencoded'
			},
			body: 'grant_type=refresh_token&refresh_token=' + REFRESH_TOKEN
		}
		fetch('https://accounts.spotify.com/api/token', authParameters)
			.then(result => result.json())
			.then(data => {
				setAccessToken(data.access_token);
			})
	}, [])

	async function getQueue(){
		clearSearchBar();

		await fetch('https://api.spotify.com/v1/me/player/queue', searchParameters)
			.then(response => response.json())
			.then(data => {
				setIsLocked(true);
				if(data.currently_playing == null){
					setIsListening(false);
					setHasCurrent(false);
				}
				else{
					setTracks(data.queue);
					setHasCurrent(data.currently_playing);
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

	async function search(){
		setIsListening(true)
		setIsLocked(false);
		setHasCurrent(false);
	
		await fetch('https://api.spotify.com/v1/search?q=' + searchInput + '&type=track&limit=50', searchParameters)
			.then(response => response.json())
			.then(data => {
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
				{hasCurrent && (
						
						<>
						<p id="emRep"> Em reprodução </p>
						<div id="card" className="cartao dark my-1 borda">
							<img className="cartao linha cover py-1" src={hasCurrent.album.images[0].url} alt="song album"></img>
							<p className="mx-2 my-0 linha songName">{hasCurrent.name}</p>
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

				{isListening && (
					tracks.map( (track, i) => {
						return (
							<div id="card" className="cartao dark my-1 borda" onClick={() => handleMusicSelection(track.uri)} style={{ cursor: "pointer" }}>
								<img className="cartao linha cover py-1" src={track.album.images[0].url} alt="song album"></img>
								<p className="mx-2 my-0 linha songName">{track.name}</p>
							</div>
						)
					})
				)}
			</div>
		</div>
	);
}

export default App;

