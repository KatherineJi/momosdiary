var getKeyFrames = function(index){
  var styleSheet = document.styleSheets[index], keyframesRule = [];
  [].slice.call(styleSheet.cssRules).forEach(function(item){
    if (item.type === CSSRule.WEBKIT_KEYFRAMES_RULE) {
      keyframesRule.push( item );
    }
  })
  return keyframesRule;
}


function longRate(absoluteX,absoluteY){
	    var juLi=Math.sqrt(absoluteX*absoluteX+absoluteY*absoluteY);
		var rate=1;
		if(juLi>=150){
	      	rate=1;
	  	}else if(juLi<=1.5){
	      	rate=0;
	  	}else{
	      	rate=juLi/150;
		  	rate=rate>1?1:rate;
	  	}
	  	return rate;
	}
	
jQuery(function () {
	var leftEye = $(".bleft"),
		leftEyePos = leftEye.offset(),
		rightEye = $(".bright"),
		rightEyePos = rightEye.offset(),
		apple = $(".apple"),
		pointX,
		pointY;
		
	function getPos(obj){
		    var p={};
			p.x=obj.offset().left;
			p.y=obj.offset().top;
			var i=0;
			while((obj=obj.offsetParent())&&i<5){
				console.log(p.x);
				i++;
		     	p.x+=obj.offset().left;
			 	p.y+=obj.offset().top;
			 	
		 	};
		 	return p;
		}
		
	console.log(leftEyePos);	
	
    $("body").bind("mousemove",function(e){
		pointX = e.pageX;
		pointY = e.pageY;
		
		//Left
		var absoluteX = pointX - leftEyePos.left;
		var absoluteY = pointY - leftEyePos.top;
		
		var tempX=25*longRate(absoluteX,absoluteY);
		var tempY=30*longRate(absoluteX,absoluteY);
		
		var p={x:0,y:0};
		p.x=absoluteX/Math.abs(absoluteX)*Math.sqrt(tempX*tempX/(1+absoluteY*absoluteY/(absoluteX*absoluteX)))+27;
		p.y=absoluteY/Math.abs(absoluteY)*Math.sqrt(tempY*tempY/(1+absoluteX*absoluteX/(absoluteY*absoluteY)))+33;
		
		leftEye.css('left',p.x+'px');
		leftEye.css('top',p.y+'px');
		
		//Right
		var absoluteX = pointX - rightEyePos.left;
		var absoluteY = pointY - rightEyePos.top;
		
		var tempX=25*longRate(absoluteX,absoluteY);
		var tempY=30*longRate(absoluteX,absoluteY);
		
		var p={x:0,y:0};
		p.x=absoluteX/Math.abs(absoluteX)*Math.sqrt(tempX*tempX/(1+absoluteY*absoluteY/(absoluteX*absoluteX)))+27;
		p.y=absoluteY/Math.abs(absoluteY)*Math.sqrt(tempY*tempY/(1+absoluteX*absoluteX/(absoluteY*absoluteY)))+33;
		
		rightEye.css('left',p.x+'px');
		rightEye.css('top',p.y+'px');
		
		apple.css({'left':pointX,'top':pointY});
		
		
		
/*
		if(pointX<300){
			leftEye.css('left','5px');
			rightEye.css('left','8px');
		}else if(300<=pointX && pointX<346){
			leftEye.css('left',(pointX-300+5)+'px');
			rightEye.css('left','8px');
		}else if(346<=pointX && pointX<384){
			leftEye.css('left','50px');
			rightEye.css('left','8px');
		}else if(384<=pointX && pointX<429){
			leftEye.css('left','50px');
			rightEye.css('left',(pointX-384+8)+'px');
		}else if(pointX>=429){
			leftEye.css('left','50px');
			rightEye.css('left','53px');
		}
		
		if(pointY<150){
			leftEye.css('top','5px');
			rightEye.css('top','5px');
		}else if(150<=pointY && pointY<210){
			leftEye.css('top',(pointY-150+5)+'px');
			rightEye.css('top',(pointY-150+5)+'px');
		}else if(210<=pointY){
			leftEye.css('top','65px');
			rightEye.css('top','65px');
		}
*/
		
// 		console.log(pointX+','+pointY);
	});
	
	
	
	
	
})	
	
