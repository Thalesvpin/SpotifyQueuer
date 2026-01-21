


import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import {InputGroup, FormControl} from 'react-bootstrap';
import {useState, useEffect, useCallback} from 'react';
import logo from "./imgs/logo.png";

const CLIENT_AUTH = process.env.REACT_APP_CLIENT_AUTH;
const REFRESH_TOKEN = process.env.REACT_APP_REFRESH_TOKEN;
const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
const REDIRECT_URI = "https://spotifyqueuer.netlify.app";

const body = document.querySelector("#root");

function delay(ms){
	return new Promise(resolve => 
		setTimeout(resolve, ms)
	);
};

function App(){
	const [accessToken, setAccessToken] = useState("");
	const [authorizationCode, setAuthorizationCode] = useState("");
	const [refreshToken, setRefreshToken] = useState("");
	const [searchInput, setSearchInput] = useState("");
	const [tracks, setTracks] = useState([]);
	const [isLocked, setIsLocked] = useState(false);
	const [isListening, setIsListening] = useState(true);
	const [hasCurrent, setHasCurrent] = useState('');

	

	const searchParameters = {
		method: 'GET',
		headers: {
			'Content-Type' : 'application/json',
			'Authorization': `Bearer ${accessToken}`
		}
	};

	// function ORDEM(){
	// 	requestUserAuthorization();
	// 	// pagina recarrega
	// 	requestAccessToken();

	// }

	const requestUserAuthorization = useCallback(() => {
		console.log('requesting user authorization...');
		window.open(`https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}`,'_blank');
	}, []);

	const refreshAccessToken = useCallback(async () => {
		console.log('refreshing token...');
		var config = {
			method: 'POST',
			headers: {
				'Authorization': `Basic ${CLIENT_AUTH}`,
				'Content-Type' : 'application/x-www-form-urlencoded'
			},
			body: `grant_type=refresh_token&refresh_token=${REFRESH_TOKEN}`
		}
		try{
			fetch('https://accounts.spotify.com/api/token', config)
				.then(result => result.json())
				.then(async data => {
					if(data.error_description === "Refresh token revoked"){
						await requestUserAuthorization();
						return;
					}
					setAccessToken(data.access_token);
					
					setTimeout(() => {
						refreshAccessToken();
					}, 3660000);
				})
		}
		catch(error){
			console.log('Error refreshing access token:', error);
		}
	}, [requestUserAuthorization]);

	const requestAccessToken = useCallback(async () =>{
		console.log('requesting access token...');
		var config = {
			method: 'POST',
			headers: {
				'Authorization': `Basic ${CLIENT_AUTH}`,
				'Content-Type' : 'application/x-www-form-urlencoded'
			},
			body: `grant_type=authorization_code&code=${authorizationCode}&redirect_uri=${REDIRECT_URI}`
		}
		fetch('https://accounts.spotify.com/api/token', config)
			.then(result => result.json())
			.then(data => {
				console.log('access token data:', data);
				setRefreshToken(data.refresh_token);
				setAccessToken(data.access_token);
				
				setTimeout(() => {
					refreshAccessToken();
				}, 3660000);
			})
	}, [authorizationCode, refreshAccessToken]);

	useEffect(() => {
		// console.log('isso ta rodando?');
		const params = new URLSearchParams(window.location.search);
		if(params.size > 0){
			const code = params.get('code');
			setAuthorizationCode(code);
			console.log('authorization code:', code);
			window.history.replaceState({}, document.title, window.location.pathname);
			requestAccessToken()
		}
	}, [setAuthorizationCode, requestAccessToken]);

	async function getQueue(){
		clearSearchBar();

		try{
			await fetch('https://api.spotify.com/me/player/queue', searchParameters)
				.then(response => response.json())
				.then(data => {
					if(data?.error){
						console.log('erro na fila', data.error);
						throw data.error;
					}
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
		catch(error){
			console.log('Erro:', error);
			if(error.status === 401 || error.status === 400){
				requestUserAuthorization();
			}
		}

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

