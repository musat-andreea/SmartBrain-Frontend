import React, {Component} from 'react';
import Particles from 'react-particles-js';
import Navigation from './components/Navigation/Navigation.js';
import Logo from './components/Logo/Logo.js';
import SignIn from './components/SignIn/SignIn.js';
import ImageLinkForm from './components/ImageLinksForm/ImageLinksForm.js';
import Rank from './components/Rank/Rank.js';
import Register from './components/Register/Register.js';
import FaceRecognition from './components/FaceRecognition/FaceRecognition.js';
import './App.css';


const particleOptions = {
  particles: {
    /*line_linked: {
      shadow: {
        enable: true,
        color: "#3CA9D1",
        blur: 5
      }
    }
    */
     number: {
       value: 60,
       density: {
         enable: true,
         value_area: 800
       }
     }
  }
};

  const initialState = {

    input: '',
    imageUrl: '',
    box: {},
    route: 'signin',
    isSignedIn: false,
    user: {
      id: '',
      name: '',
      email: '',
      entries: 0,
      joined: ''
    }
  };




//function App() {
 class App extends Component {
   constructor(){
     super();
     this.state = initialState;
   }

   loadUser = (data) => {
     this.setState({user: {
         id: data.id,
         name: data.name,
         email: data.email,
         entries: data.entries,
         joined: data.joined
       }})
   };

/*
   componentDidMount() {
     fetch('https://smartbrain-api-medeea.herokuapp.com/')
         .then(response => response.json())
         .then(console.log) // data => console.log(data)
   }
*/
   calculateFaceLocation = (data) => {
     const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
     const image = document.getElementById('inputImage');
     const width = Number(image.width);
     const height = Number(image.height);
     //console.log(width, height);
     return {
       leftCol: clarifaiFace.left_col * width,
       topRow: clarifaiFace.top_row * height,
       rightCol: width - (clarifaiFace.right_col * width),
       bottomRow: height - (clarifaiFace.bottom_row * height)
     }
   };

   displayFaceBox = (box) => {
     //console.log(box);
     this.setState({box: box})
   };

   onInputChange = (event) => {
      //console.log(event.target.value);
     this.setState({input: event.target.value});
   };

   onButtonSubmit = () => {
     //console.log('click');
     this.setState({imageUrl: this.state.input});
     fetch('https://smartbrain-api-medeea.herokuapp.com/imageurl', {
       method: 'post',
       headers: {'Content-Type': 'application/json'},
       body: JSON.stringify({
         input: this.state.input
       })
     })
         .then(response => response.json())
    /* app.models
         .predict(
         //"a403429f2ddf4b49b307e318f00e528b",
         //Clarifai.COLOR_MODEL,
            Clarifai.FACE_DETECT_MODEL,
         //"https://samples.clarifai.com/face-det.jpg")
            this.state.input)*/
         //.then(response =>
         //function(response) {
           //console.log(response.outputs[0].data.regions[0].region_info.bounding_box);
         .then(response => {
           if(response) {
             fetch('https://smartbrain-api-medeea.herokuapp.com/image', {
               method: 'put',
               headers: {'Content-Type': 'application/json'},
               body: JSON.stringify({
                 id: this.state.user.id
               })
             })
                 .then(response => response.json())
                 .then(count => {
                   this.setState(Object.assign(this.state.user, { entries:count}))
                 })
                 .catch(console.log)
           }
           this.displayFaceBox(this.calculateFaceLocation(response))
         })
         /*function(err) {
           // there was an error
         }*/
         .catch(err => console.log(err));

   };

   onRouteChange = (route) => {
     if (route === 'signout') {
       this.setState(initialState)
     } else if(route === 'home') {
       this.setState({isSignedIn: true})
     }
     this.setState({route: route});
   };

   render() {
     const { isSignedIn, imageUrl, route, box} = this.state;
     return (
         <div className="App">
           <Particles className='particles'
                      params={particleOptions}
               /*{
               particles: {
                 line_linked: {
                   shadow: {
                     enable: true,
                     color: "#3CA9D1",
                     blur: 5
                   }
                 }
               }
             }*/
               //}
           />
           <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange}/>
           { route === 'home'
               ? <div>
                 < Logo />
                 < Rank name={this.state.user.name} entries={this.state.user.entries}/>
                 < ImageLinkForm
                     onInputChange={this.onInputChange}
                     onButtonSubmit={this.onButtonSubmit}
                 />
                 <FaceRecognition box={box} imageUrl={imageUrl}/>
               </div>
               //< SignIn onRouteChange={this.onRouteChange}/>
               : (
                   route === 'signin'
                   ? < SignIn loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
                   : < Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
               )
           }
         </div>
     );
   }
}

export default App;
