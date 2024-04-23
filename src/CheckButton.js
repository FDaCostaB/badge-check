import React, { useState } from "react";

const RED = 0;
const GREEN = 1;
const BLUE = 2;
const ALPHA = 3;

/// <summary>
/// A button that, when clicked, check if the image loaded is of size 512x512, the only non transparent pixels are within a circle, and that the colors is the badge give a "happy" feeling
/// </summary>
/// <param>Vertex animation shader</param>
/// <returns>Describe return value.</returns>
function CheckButton(url) {
	const [checkResult, setCheckResult] = useState();

    /// <summary>
    /// Check if the image loaded is of size 512x512, the only non transparent pixels are within a circle, and that the colors is the badge give a "happy" feeling
    /// </summary>
    /// <returns>True if the requirement are met</returns>
	function checkBadge() {
		var img = new Image();
		img.src = url.url;
		
		if(img.width !== 512 || img.height !== 512){
			setCheckResult(false);
			return;
		}
		
	setCheckResult(true);
	return;
  }
  
  return (
	<div className="CheckButton">
		<button onClick={checkBadge}>Check</button>
		<p> {'Result: ' + (checkResult === undefined?"":checkResult.toString())} </p>
	</div>
  );
}

export default CheckButton;