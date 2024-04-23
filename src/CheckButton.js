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
    /// Convert a RGB to HSV color
    /// </summary>
	/// <param name="r">red channel of the input color in range [0,255]</param>
	/// <param name="g">green channel of the input color in range [0,255]</param>
	/// <param name="b">blue channel of the input color in range [0,255]</param>
    /// <returns>A HSV color with h in range [0,360], s in range [0,100] and V in range [0,100]</returns>
	//Source : https://stackoverflow.com/questions/17242144/javascript-convert-hsb-hsv-color-to-rgb-accurately
	function RGBtoHSV(r, g, b) {

		var max = Math.max(r, g, b);
		var min = Math.min(r, g, b);
		var d = max - min;
		var h;
		var s = (max === 0 ? 0 : d / max);
		var v = max / 255;
		
		switch(max){
			case min: 
				h = 0;
				break;
			case r: 
				h = (g - b) + d * (g < b ? 6: 0);
				h /= 6 * d;
				break;
			case g: 
				h = (b - r) + d * 2;
				h /= 6 * d; 
				break;
			case b: 
				h = (r - g) + d * 4;
				h /= 6 * d; 
				break;
		}

		return {h: h * 360, s: s * 100, v: v * 100};
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
		
		let r = 0;
		let g = 0;
		let b = 0;
		let sum = 0;
	
		for(let y = 0; y < img.height; y++){
			for(let x = 0; x < img.width; x++){
				let pixelIdx = pixelCoordinate(x, y);
				radius = radius * 1.01; // Adding 1 percent tolerance in case anti-aliasing fade a bit outside the circle 
				if(!inCircle(x, y, radius * 1.01) && data[(pixelIdx * 4) + ALPHA] === 255){ // Checked that no opaque pixel are outside the circle (ie. only non-transparent pixels are within a circle)
					setCheckResult(false);
					return;
				}
				
				// Averaging color of the picture
				let pixelR = data[(pixelIdx * 4) + RED] * (data[(pixelIdx * 4) + ALPHA] / 255);
				let pixelG = data[(pixelIdx * 4) + GREEN] * (data[(pixelIdx * 4) + ALPHA] / 255);
				let pixelB = data[(pixelIdx * 4) + BLUE] * (data[(pixelIdx * 4) + ALPHA] / 255);
				
				sum += data[(pixelIdx * 4) + ALPHA] / 255;
				
				
				// Averaging square gives more natural result aand tends to preserve a correct brightness
				// Brightness is important to determine color happiness later on
				// Color space works should account for how human perceive them
				// https://www.youtube.com/watch?v=LKnqECcg6Gw
				r += pixelR * pixelR;
				g += pixelG * pixelG;
				b += pixelB * pixelB;
			}
		}
		
		//The root of the value sould be use
		r = Math.sqrt(r / sum);
		g = Math.sqrt(g / sum);
		b = Math.sqrt(b / sum);
		
		//Conversion to HSV as it is easier to make assumption upon HSV values in my opinion
		console.log("Average color RGB: ("+ parseInt(r)+", "+parseInt(g)+", "+parseInt(b)+")");
		let hsvColor = RGBtoHSV(r, g, b);
		console.log("Average color HSV: ("+ parseInt(hsvColor.h)+", "+parseInt(hsvColor.s)+", "+parseInt(hsvColor.v)+")");
		
		// Magenta, Red, Orange, Yellow get accepted and the rest rejected
		if( parseInt(hsvColor.h) < 300 && parseInt(hsvColor.h) > 90){ 
			setCheckResult(false);
			return;
		}
		
		// Colors bellow 75% value(brightness) gets rejected because dark color are not happy
		if( parseInt(hsvColor.v) < 75){
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