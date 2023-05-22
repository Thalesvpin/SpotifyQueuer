import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, InputGroup, FormControl, Button, Row, Card} from 'react-bootstrap';
import {useState, useEffect} from 'react';

// const CLIENT_ID = "28d80bad61ea4028bbd07381084d5beb";
// const CLIENT_SECRET = "e69ed4afd34341578d7f17e97f3fbc3a";
const CLIENT_AUTH = "MjhkODBiYWQ2MWVhNDAyOGJiZDA3MzgxMDg0ZDViZWI6ZTY5ZWQ0YWZkMzQzNDE1NzhkN2YxN2U5N2YzZmJjM2E=";
const REFRESH_TOKEN = "AQA-46a_erftWahtM8Rmu4iYAFZBzITDUza3rKYSjaB74btApWdBxaEpG-zfc4vWcsDIXVJAok8S2fBreovrCFMhc1e4rRmJsYSHEQkyycm8fZFqHz0HyBpcmgLiETyp3Io";

function App(){
	const[searchInput, setSearchInput] = useState("");
	const[accessToken, setAccessToken] = useState("");
	// const[albums, setAlbums] = useState([]);
	const[tracks, setTracks] = useState([]);

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

//===================================================================
	
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










	return(
		<div className="App">
			<Container>
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
					<Button onClick={search}>
						Buscar
					</Button>
				</InputGroup>
			</Container>
			<Container className="card">
			    <Row className="mx-2 row row-cols-1">
					{tracks.map( (track, i) => {
						// console.log(track)
						return (
							<Card className="mb-3 card2" tag='a' onClick={() => addToQueue(track.uri)} style={{ cursor: "pointer" }}>
								<Card.Img src={track.album.images[0].url} />
								<Card.Body>
									<Card.Title>{track.name}</Card.Title>									
								</Card.Body>
							</Card>
						)
					})}
				</Row>
			</Container>
		</div>
	);
}

export default App;