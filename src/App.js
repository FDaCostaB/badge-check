import React, { useState } from "react";
import CheckButton from "./CheckButton.js";
import styles from './App.css';

function App() {
    const [badgeURL, setBadgeURL] = useState();
    function handleChange(e) {
		if (e.target.files.length >= 1){
			setBadgeURL(URL.createObjectURL(e.target.files[0]));
		}
    }
 
    return (
        <div className="App Container">
            <h2>Badge check:</h2>
            <input type="file" accept="image/png" onChange={handleChange} />
			<div className="badge-display">
				<img src={badgeURL} alt='Badge'/>
			</div>
			<CheckButton url={badgeURL}/>
        </div>
    );
}

export default App;