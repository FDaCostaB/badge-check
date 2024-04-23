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
    /// Compute the index in a 1D from a 2D coordinate given a picture of size width*height
    /// </summary>
	/// <param name="x">x coordinate from top left corner</param>
	/// <param name="y">y coordinate from top left corner</param>
	/// <param name="width">Picture's width</param>
	/// <param name="height">Picture's heigt</param>
    /// <returns>Index in a 1D array representing a 2D picture</returns>
	function pixelCoordinate(x, y, width =512, height =512) {
		return y * width + x;
	}
	
	/// <summary>
    /// Verify that a point is inside a circle of a given radius 
    /// </summary>
	/// <param name="x">x coordinate from top left corner</param>
	/// <param name="y">y coordinate from top left corner</param>
	/// <param name="radius">Radius of the cirlce to check</param>
	/// <param name="width">Picture's width</param>
	/// <param name="height">Picture's heigt</param>
    /// <returns>Index in a 1D array representing a 2D array</returns>
	function inCircle(x, y, radius = 256, width = 512, height = 512) {
		let centeredX = x - (width/2);
		let centeredY = y - (height/2);
		return centeredX * centeredX + centeredY * centeredY <= radius * radius;
	}
	
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
		
		//Canvas are the easiest wayt to access pixel data in JS
		const canvas = document.createElement('canvas');
		canvas.id     = "Badge";
		canvas.width  = img.width;
		canvas.height = img.height;
		
		const context = canvas.getContext('2d');
		context.drawImage(img, 0, 0, img.width, img.height);
		const { data } = context.getImageData(0, 0, img.width, img.height);
		
		//The instruction say 'a circle' so i assumed it might not always be the biggest circle (of radius 256)
		let radius = 0;
		for(let x = 256; x < img.width; x++){
			let pixelIdx = pixelCoordinate(x, 255);
			if(data[(pixelIdx * 4) + ALPHA] > 0)
				radius += 1;
			else
				break;
		}
		
		// A warning is log if the circle is not the biggest as it will impact the resolution of the asset
		if(radius < 256){
			console.log("Badge is not of maximal size of the 512 by 512 image");
			console.log("Radius: " + radius);
		}
		
		for(let y = 0; y < img.height; y++){
			for(let x = 0; x < img.width; x++){
				let pixelIdx = pixelCoordinate(x, y);
				radius = radius * 1.01; // Adding 1 percent tolerance in case anti-aliasing fade a bit outside the circle 
				if(!inCircle(x, y, radius * 1.01) && data[(pixelIdx * 4) + ALPHA] === 255){ // Checked that no opaque pixel are outside the circle (ie. only non-transparent pixels are within a circle)
					setCheckResult(false);
					return;
				}
			}
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