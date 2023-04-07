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
			.then(data => setAccessToken(data.accessToken))
	}, [])

	async function search(){
		console.log("Search for " + searchInput);

		//GET request pra pegar id das musicas
		// https://api.spotify.com/v1/search
		// 'q=' + pesquisa + '&type=track'
		// data.items.external_urls.spotify
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
				<Card>
						<Card.Img src="#" />
						<Card.Body>
							<Card.Title>Album name here</Card.Title>
						</Card.Body>
					</Card>
					<Card>
						<Card.Img src="#" />
						<Card.Body>
							<Card.Title>Album name here</Card.Title>
						</Card.Body>
					</Card>
					<Card>
						<Card.Img src="#" />
						<Card.Body>
							<Card.Title>Album name here</Card.Title>
						</Card.Body>
					</Card>
					<Card>
						<Card.Img src="#" />
						<Card.Body>
							<Card.Title>Album name here</Card.Title>
						</Card.Body>
					</Card>
				</Row>
			</Container>
		</div>
	);
}

export default App;