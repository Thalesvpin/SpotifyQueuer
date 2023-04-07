import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, InputGroup, FormControl, Button, Row, Card} from 'react-bootstrap';
import {useState, useEffect} from 'react';

function App(){
    const[searchInput, setSearchInput] = useState("");
    return(
        <div classname="App">
            <Container>
                <InputGroup className="mb3" size="lg">
                    <FormControl
                        placeholder="Buscar..."
                        type="input"
                        onKeyPress={event => {
                            if(event.key == "Enter"){
                                console.log("pressed enter");
                            }
                        }}
                        onChange={event => setSearchInput(event.target.value)}
                    />
                    <Button onClick={event => {console.log("pesquisou")}}>
                        Buscar
                    </Button>
                </InputGroup>
            </Container>
            <Container>
                <Card>
                    <Card.Img src="#" />
                    <Card.Body>
                        <Card.Title>Album name here</Card.Title>
                    </Card.Body>
                </Card>
            </Container>
        </div>
    );
}

export default App;