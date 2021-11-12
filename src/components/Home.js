import {React, useState} from 'react';
import { Image, Form, Button, Modal, Spinner} from 'react-bootstrap';
import axios from 'axios';

import 'bootstrap/dist/css/bootstrap.min.css';

function ImageComponent(props){
    if (!props.img) {
        return <span></span>
    } 
    else {
        return <Image src={props.img} thumbnail/>
    }
}

// Get search query terms from user
export default function Home() {
    const [image, setImage] = useState();
    const [imageDisp, setImageDisp] = useState();
    const [imageUpscaled, setImageUpscaled] = useState();
    const [username, setUsername] = useState();
    const [load, setLoad] = useState(false);

    const [show, setShow] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    function UpscaleImg()
    {
        if (load)
        {
            return (
                <div className = "spinner">
                    <Spinner animation = "border">
                    <span className="visually-hidden">Loading...</span>
                    </Spinner>
                    <div className = "loading...">
                    Processing...
                    </div>  
                </div>
        
            )
        }
        else if (imageUpscaled === undefined)
        {
            return (
                <Form.Group className="upscaled" controlId="upscaled">
                <ImageComponent id={"upscaledImg"} img={imageUpscaled}/>
                </Form.Group>
            )
        } 
        else
        {
            return (
                <Form.Group className="upscaled" controlId="upscaled">
                <ImageComponent id={"upscaledImg"} img={"data:image/png;base64," + imageUpscaled}/>
                </Form.Group>
            )
        }
    }

    const uploadImage = event => {
        let img = event.target.files[0];
        if ((img.type === "image/png" && img.size <= 112740) || (img.type === "image/jpeg" && img.size <= 16932))
        {
            setImage(event.target.files[0])
            setImageDisp(URL.createObjectURL(event.target.files[0]))
        }
        else 
        {
            setErrorMessage("Only accepts up to 300x300 .png and .jpg files :(");
            setShow(true);
        }

    }

    const handleClick = event => {
        if (username == null)
        {
            setErrorMessage("Please enter in a username");
            setShow(true);
        }
        else if (image == null)
        {
            setErrorMessage("Please upload an image");
            setShow(true);
        }
        else 
        {
            fetchID(setImageUpscaled, setLoad, image, username);
        }

    }

    const handleClose = () =>{
        setShow(false);
    } 

    return (
        <div className = "register">
            <Image src="https://www.gamerevolution.com/assets/uploads/2021/01/Easy-AI-upscale-1080p-4K.png" roundedCircle/>
            <h2 style = {{marginTop: "50px"}}>Username</h2>
            <Form.Control type="text" placeholder="Username" onChange={(event) => { setUsername(event.target.value)}}/>
            <h2 style = {{marginTop: "50px"}}>Upload Image</h2>
            <Form>

                <div className = "Input" style={{height: '300px', width: '300px'}}>
                    <Form.Group className="upload" controlId="upload">
                        <Form.File style={{color:"transparent"}} onChange={(event) => uploadImage(event)} accept=".png, .jpg, .   jpeg" size="128000"/>
                        <ImageComponent img={imageDisp}/>
                    </Form.Group>
                </div>

                <div>
                <Button variant="primary" onClick={handleClick}>Upscale</Button>
                </div>

                <div className = "Output">
                    <UpscaleImg/>
                </div>

            </Form>

            <div className = "error">
                <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Opps something went wrong :(</Modal.Title>
                </Modal.Header>
                <Modal.Body>{errorMessage}</Modal.Body>
                </Modal>
            </div>
        </div>
    );
}

async function fetchID(setImageUpscaled, setLoad, imageBuf, username)
{
    setLoad(true);
    var formData = new FormData();
    formData.append('image', imageBuf, imageBuf.name)

    const id = await axios.post('http://n10201114-magnify-LB-1493282653.ap-southeast-2.elb.amazonaws.com/upload?username=' + username, formData)

    fetchImg(setImageUpscaled, setLoad, id.data);
} 

async function fetchImg(setImageUpscaled, setLoad, imgId)
{
    const image = await axios.get('http://n10201114-magnify-LB-1493282653.ap-southeast-2.elb.amazonaws.com/image?id=' + imgId)
    if (image.data === 'NoImage')
    {
        setTimeout(function() {fetchImg(setImageUpscaled, setLoad, imgId)}, 1000);
    }
    else 
    {
        setImageUpscaled(image.data); 
        setLoad(false);
    }
}