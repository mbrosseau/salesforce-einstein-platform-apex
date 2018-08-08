({

    analyze: function(component, url) {
        
        var helper = this;
          helper.changeSpinner(component);
        
        var dataset = component.get("v.dataset");
       var modelId = component.get("v.modelId");
        var label = component.get("v.label");
        var filename = "img" + (Math.random()*10000000).toFixed(0) + ".jpg";
        var labelList = dataset.labelSummary.labels; 
        
        if(label == null || label.length == 0) {          
            
            if(labelList != null || labelList.length !=0 ) {
                label = labelList[0].name;
                component.set("v.label", label); 
            }
        }
        var labelId = null;
        for(var i=0; i<labelList.length; i++) {
            if(label == labelList[i].name) {
                labelId =  labelList[i].id;
            }
        }
        
        console.log("Sending feedback - " + labelId + " - " + dataset.id + ' ' + filename  + ' ');
        var action = component.get("c.createVisionExample"); 
        // name,  expectedLabel,  modelId,  url
        action.setParams({     
            modelId: modelId,
            name: filename,
            expectedLabel: label,
            url: url
        });
        
        action.setCallback(this, function(response) {
            
            
            //component.set("v.spinnerWaiting", false);
            
            var state = response.getState();
            var errors = action.getError();
            if(state === 'SUCCESS') {
              
                  var toastEvent = $A.get("e.force:showToast");
    			toastEvent.setParams({  "title": "Success!",  "message": "Feedback was sent successfully."});
   	 			toastEvent.fire(); 
                
                var returnValue = response.getReturnValue();
                
                console.log(returnValue);
                
                var probabilities = returnValue.probabilities;
                
                var meterWidth =  (probabilities[0].probability *100);
                
                component.set("v.prediction", probabilities[0].label);
                component.set("v.probability", probabilities[0].probability);
                component.set("v.meterWidth", meterWidth + '%');
                component.set("v.fileName", returnValue.original_fileName);
                component.set("v.attachId", returnValue.attachment_id);
                component.set("v.fileType", file.type);
                
                
            } else if(state === 'ERROR') {
                
                $A.log("Errors", errors);
                this.handleErrors(errors);
            }
            helper.changeSpinner(component); 
        });
        
           $A.enqueueAction(action); 
        component.set("v.prediction", "Getting prediction...");   
    }
})