import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, InputGroup, FormControl, Button, Row, Card} from 'react-bootstrap';
import {useState, useEffect} from 'react';

const CLIENT_ID = "28d80bad61ea4028bbd07381084d5beb";
const CLIENT_SECRET = "e69ed4afd34341578d7f17e97f3fbc3a";
const CLIENT_AUTH = "MjhkODBiYWQ2MWVhNDAyOGJiZDA3MzgxMDg0ZDViZWI6ZTY5ZWQ0YWZkMzQzNDE1NzhkN2YxN2U5N2YzZmJjM2E=";

function App(){
	const[searchInput, setSearchInput] = useState("");
	const[accessToken, setAccessToken] = useState("");
	const[albums, setAlbums] = useState([]);

	useEffect(() => {
		console.log(CLIENT_AUTH.toString('base64'));
		//API Access Token
		var authParameters = {
			method: 'POST',
			headers: {
				'Authorization': 'Basic ' + CLIENT_AUTH,
				'Content-Type' : 'application/x-www-form-urlencoded'
			},
			body: 'grant_type=client_credentials'
			// json: true
			// body: 'grant_type=client_credentials&client_id=' + CLIENT_ID + '&client_secret=' + CLIENT_SECRET
		}
		fetch('https://accounts.spotify.com/api/token', authParameters)
			.then(result => result.json())
			.then(data => setAccessToken(data.access_token))
	}, [])








	async function search(){
		console.log("Search for " + searchInput);

		//GET request pra pegar id das musicas
		var searchParameters = {
			method: 'GET',
			headers: {
				'Content-Type' : 'application/json',
				'Authorization': 'Bearer ' + accessToken
			}
		}
		var artistID = await fetch('https://api.spotify.com/v1/search?q=' + searchInput + '&type=artist', searchParameters)
			.then(response => response.json())
			.then(data => {return data.artists.items[0].id})

		// https://api.spotify.com/v1/search
		// 'q=' + pesquisa + '&type=track'
		// data.items.external_urls.spotify

		var returnedAlbums = await fetch('https://api.spotify.com/v1/artists/' + artistID + '/albums' + '?include_groups=album&market=BR&limit=50', searchParameters)
			.then(response => response.json())
			.then(data => setAlbums(data.items))
	}












	return(
		<div className="App">
			<Container>
				<InputGroup className="mb3" size="lg">
					<FormControl
						placeholder="Buscar..."
						type="input"
						onKeyPress={event => {
							if(event.key == "Enter"){
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
			<Container>
				<Row className="mx-2 row row-cols-4">
					{albums.map( (album, i) => {
						console.log(album)
						return (
							<Card>
								<Card.Img src={album.images[0].url} />
								<Card.Body>
									<Card.Title>{album.name}</Card.Title>
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