({
  upload: function(component, fileName, base64Data) {

    var imgContainer = component.find("imgContainer").getElement();
    while (imgContainer.firstChild) {
      imgContainer.removeChild(imgContainer.firstChild);
    }
    var action = component.get("c.detectShelfObjects");
    var modelId = component.get("v.modelId");
    action.setParams({
      modelId: modelId,
      base64: base64Data
    });
    action.setCallback(this, function(a) {
   
    component.set("v.spinnerWaiting", false);
      var state = a.getState();
      if (state === "ERROR") {
          console.log(a);
          var errors = a.getError();
          this.handleErrors(errors);
        return;
       
      }

              
      var result = a.getReturnValue();
      var rawPredictions = JSON.stringify(result, null, 4);
      component.set("v.predictions", result);
      component.set("v.rawPredictions", rawPredictions);
      var ro = new ResizeObserver(entries => {
        this.generateSvg(component);
      });
      var img = component.find("imgItself").getElement();
      ro.observe(img);
      this.calculateShelfData(component);
      component.set("v.showDatatable", true);
          
         
          var compEvent = component.getEvent("scanCompletedEvent");
		compEvent.fire();     
          
       var postToChatter = component.get("v.postToChatter");
        		var attachImage = component.get("v.attachImage");
        
       if(postToChatter && !attachImage) {
            let errors = [];
            let errorItem =  {message: 'Vision Component Configuration Error: Posting to chatter requires a file attachment. Please double check lightning component configuration.'};
			errors[0] = errorItem;
                    
           this.handleErrors(errors);
        }
          
    });
    component.set("v.predictions", null);
    component.set("v.rawPredictions", null);
    component.set("v.spinnerWaiting", true);
    $A.enqueueAction(action);
  },
  generateSvg: function(component) {
    var imgContainer = component.find("imgContainer").getElement();
    var img = component.find("imgItself").getElement();

    var proportion = img.clientHeight / img.naturalHeight;
    if (proportion > 1) {
      proportion = 1;
    }

    var predictions = component.get("v.predictions");
      if(predictions == null) { return; }
      
    var probabilities = component.get("v.predictions").probabilities;

    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    var svgNS = svg.namespaceURI;

    var leftPos = img.offsetLeft;
    var topPos = img.offsetTop;
      
    probabilities.forEach(function(probability) {
      var color = this.getObjectHighlightColor(probability.label);
      // create polygon for box
      var polygon = document.createElementNS(svgNS, "polygon");
      polygon.setAttribute(
        "style",
        "stroke:" + color + ";stroke-width:3;fill-opacity:0"
      );
      var points = [];
      points.push(
        (probability.boundingBox.minX * proportion + leftPos) + "," + probability.boundingBox.minY * proportion
      );
      points.push(
        (probability.boundingBox.maxX * proportion  + leftPos)+  "," +  probability.boundingBox.minY * proportion 
      );
      points.push(
        (probability.boundingBox.maxX * proportion + leftPos) +
          "," +
          probability.boundingBox.maxY * proportion
      );
      points.push(
       ( probability.boundingBox.minX * proportion  + leftPos) +
          "," +
          probability.boundingBox.maxY * proportion
      );
      polygon.setAttribute("points", points.join(" "));
      svg.appendChild(polygon);

      // create text box
      var div = document.createElement("div");
      div.setAttribute(
        "style",
        "position:absolute;top:" +
          probability.boundingBox.maxY * proportion +
          "px;left:" +
          (probability.boundingBox.minX * proportion + leftPos)+
          "px;width:" +
          (probability.boundingBox.maxX - probability.boundingBox.minX) *
            proportion +
          "px;text-align:center;color:" +
          color +
          ";"
      );
      div.innerHTML = probability.label;
      imgContainer.appendChild(div);
    }, this);
    imgContainer.appendChild(svg);
  },
  getObjectHighlightColor: function(label) {
    if (label === "MyLabel") {
      return "red";
    }
    return "yellow";
  },
  calculateShelfData: function(component) {
    var probabilities = component.get("v.predictions").probabilities;
    var calcObjects = {};
    var shelfData = [];
    var allObjects = 0;
    probabilities.forEach(function(probability) {
      allObjects += 1;
      if (typeof calcObjects[probability.label] === "undefined") {
        var calcObject = {};
        calcObject.count = 1;
        calcObject.label = probability.label;
        calcObjects[probability.label] = calcObject;
      } else {
        calcObjects[probability.label].count += 1;
      }
    });
    Object.keys(calcObjects).forEach(function(label) {
      calcObjects[label].percentage = (calcObjects[label].count /
        allObjects
      ).toFixed(2);
      shelfData.push(calcObjects[label]);
    });
    component.set("v.shelfData", shelfData);
  },
   createPredictionRecord: function(component){
   
       console.log("createPredictionRecord 3");
       
      var objectName = component.get("v.objectName");
      var labelFieldName = component.get("v.labelFieldName");
      var countFieldName = component.get("v.countFieldName");
      var intentLabel = component.get("v.prediction"); 
      var recordId = component.get("v.recordId"); 
      var shelfData = component.get("v.shelfData");
   
        
       if(objectName == null || objectName.length == 0) {
            console.log("objectName null");
       	return;
       }
        
       if( (labelFieldName == null || labelFieldName.length == 0) &&  (countFieldName == null || countFieldName.length == 0)) {
             console.log("Fields null");
       	return;
       }
    
       var value ;
	
       var objectList = [];
      
       //{"Data": {"attributes":
       
       for(var i=0; i<shelfData.length; i++) {
           console.log(shelfData[i]);
        	value = "{\"sobjectType\":\"" + objectName + "\"";
         //  value = "{\"" +  objectName + "\":{\"attributes\":{"
            if( (labelFieldName != null && labelFieldName.length >= 0)) {
                value = value +  ",\"" +labelFieldName  + "\": \"" + shelfData[i].label + "\"";  
            }
            if(   (countFieldName != null && countFieldName.length >= 0)) {
                value = value +  ",\"" + countFieldName  + "\": \"" + shelfData[i].count + "\"";  
            }
           value = value + "} ";
           console.log(value);
           
            var action = component.get("c.storeScanResults"); 
        action.setCallback(this, function(response) {
            var state = response.getState();
            if(state === 'SUCCESS') {
                var returnValue = response.getReturnValue();
                // Prepare a toast UI message
                var resultsToast = $A.get("e.force:showToast");
                resultsToast.setParams({
                        "title": "Success",
                        "message": "Einstein prediction saved successfully."
                    });
				$A.get('e.force:refreshView').fire();
                 $A.get("e.force:closeQuickAction").fire();
                 resultsToast.fire();
            } else if(state === 'ERROR') {
                 var errors = response.getError();
                 this.handleErrors(errors);
            }
        });
           
         action.setParams({
            dataJson: value,
             recordId: recordId,
            objectName: objectName
        });
 			$A.enqueueAction(action);
        }
    },
     analyzeContent: function(component, contentId) {
    
        var action = component.get("c.createContentUrl"); 
       
        action.setParams({     
            contentDocumentId: contentId
        });

  		action.setCallback(this, function(response) {
            console.log("Got Response analyzeContent " );
            
            var state = response.getState();
            var errors = action.getError();
            if(state === 'SUCCESS') {
              
                var returnValue = response.getReturnValue();
                 console.log("analyzeContent SUCCESS " + returnValue);
                component.set("v.imgUrl", returnValue);
          
       			this.analyseUrl(component);
                
            } else if(state === 'ERROR') {
              console.log("analyzeContent ERROR" );
               $A.log("Errors", errors);
                this.handleErrors(errors);
            } 
        });
        
          console.log("Sending .."  );
        $A.enqueueAction(action); 
       
        
    },
    
     postToChatter: function(component, contentId) {
         var action = component.get("c.postImageToChatter"); 
         
          var recId = component.get("v.recordId");
          var contentId = component.get("v.attachId");
          var classification = component.get("v.prediction");
         var comment = 'Analyzed photo.';
         console.log("Attach " + contentId);
       //postImageToChatter(String recordId, String docId, String comment) {
        action.setParams({     
            recordId: recId,
             docId: contentId,
             comment: comment
        });

  		action.setCallback(this, function(response) {
           
            var state = response.getState();
            var errors = action.getError();
            if(state === 'SUCCESS') {
                       console.log("postToChatter SUCCESS" );              
            } else if(state === 'ERROR') {
              console.log("analyzeContent ERROR" );
               $A.log("Errors", errors);
                this.handleErrors(errors);
            } 
        });
        
         
        $A.enqueueAction(action); 
         
     },
    
    analyseUrl: function(component) {
         component.set("v.spinnerWaiting", true);
    
        var action = component.get("c.analyseImageUrl"); 
        var recId = component.get("v.recordId");
        var modelId = component.get("v.modelId");
        var url = component.get("v.imgUrl");

        console.log("Analyzing " + modelId);
        
        action.setParams({     
            modelName: modelId,
            url: url
        });

        action.setCallback(this, function(response) {
            component.set("v.spinnerWaiting", false);

             console.log("Got Response analyseUrl " );
            
            var state = response.getState();
            var errors = action.getError();
            if(state === 'SUCCESS') {
                var result = response.getReturnValue();
              var rawPredictions = JSON.stringify(result, null, 4);
              component.set("v.predictions", result);
              component.set("v.rawPredictions", rawPredictions);
              var ro = new ResizeObserver(entries => {
                this.generateSvg(component);
              });
              var img = component.find("imgItself").getElement();
              ro.observe(img);
              this.calculateShelfData(component);
              component.set("v.showDatatable", true);
          
         
              var compEvent = component.getEvent("scanCompletedEvent");
            compEvent.fire();  
             var postToChatter = component.get("v.postToChatter");
             if(postToChatter) {
                 this.postToChatter(component);
             }
                
            } else if(state === 'ERROR') {
           
               $A.log("Errors", errors);
                this.handleErrors(errors);
            }
        });
        
          console.log("Sending .."  );
        $A.enqueueAction(action); 
        component.set("v.prediction", "Getting prediction...");  
        
    },
    
    analyse: function(component, file, base64Data) {
        component.set("v.spinnerWaiting", true);
        
        component.set("v.message", file.name);
        var action = component.get("c.analyseImage"); 
        var recId = component.get("v.recordId");
        var c_type = component.get("v.modelName");
        var keyContent = component.get("v.keyContent");
       

        console.log("Analyzing " + c_type);
        
        action.setParams({
            recId : recId,
            fileName: file.name,
            base64Data: base64Data,
            modelName: c_type,
            contentType: file.type,
            keyContent: keyContent
           
        });

        action.setCallback(this, function(response) {
            component.set("v.spinnerWaiting", false);

             console.log("Got Response " );
            
            var state = response.getState();
            var errors = action.getError();
            if(state === 'SUCCESS') {
                    
              var result= response.getReturnValue();
              var rawPredictions = JSON.stringify(result, null, 4);
              component.set("v.predictions", result);
              component.set("v.rawPredictions", rawPredictions);
              var ro = new ResizeObserver(entries => {
                this.generateSvg(component);
              });
              var img = component.find("imgItself").getElement();
              ro.observe(img);
              this.calculateShelfData(component);
              component.set("v.showDatatable", true);
                  
         
              var compEvent = component.getEvent("scanCompletedEvent");
            compEvent.fire();      
                    
         
            } else if(state === 'ERROR') {
             //   component.set("v.message", "Something went wrong " + errors[0].message);
               $A.log("Errors", errors);
                this.handleErrors(errors);
            }
        });
        
        console.log("Sending .."  );
        $A.enqueueAction(action); 
        component.set("v.prediction", "Getting prediction...");   
    },
   handleErrors : function(errors) {
        // Configure error toast
        let toastParams = {
            title: "Error",
            message: "Unknown error", // Default error message
            type: "error"
        };
        // Pass the error message if any
        if (errors && Array.isArray(errors) && errors.length > 0) {
            toastParams.message = errors[0].message;
        }
        // Fire error toast
        let toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams(toastParams);
        toastEvent.fire();
    }
});