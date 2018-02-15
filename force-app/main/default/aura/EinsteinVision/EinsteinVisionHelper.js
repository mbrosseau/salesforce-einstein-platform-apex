({
	getModels: function(component){
        var action = component.get("c.getCustomModels");      
        action.setCallback(this, function(response) {
            var state = response.getState();
            if(state === 'SUCCESS') {
                var returnValue = response.getReturnValue(); 
                component.set("v.model", returnValue);
            } else if(state === 'ERROR') {
                 var errors = action.getError();
             //   alert(errors[0].message);
               $A.log("Errors", errors);
                this.handleErrors(errors);
            }
        });
        $A.enqueueAction(action);
    },

    readFile: function(component, helper, file) {  
        if (!file) return;
        if (!file.type.match(/(image.*)/)) {
        return alert('Image file not supported');
    	}
        var reader = new FileReader();
        reader.onloadend = function() {
            var dataURL = reader.result;
            component.set("v.fileData", dataURL);
            component.set("v.pictureSrc", dataURL);
            helper.analyse(component, file, dataURL.match(/,(.*)$/)[1]);
        };
        reader.readAsDataURL(file);
    },
    
    analyse: function(component, file, base64Data) {
        component.set("v.spinnerWaiting", true);
        
        component.set("v.message", file.name);
        var action = component.get("c.analyseImage"); 
        var recId = component.get("v.recordId");
        var c_type = component.get("v.modelName");
        var keyContent = component.get("v.keyContent");
        var email = component.get("v.einsteinAcctEmail");

        action.setParams({
            recId : recId,
            fileName: file.name,
            base64Data: base64Data,
            modelName: c_type,
            contentType: file.type,
            keyContent: keyContent,
            email: email
        });

        action.setCallback(this, function(response) {
            component.set("v.spinnerWaiting", false);
            console.log("Callback called");
            console.log("Model Name:" + c_type);
            var state = response.getState();
            var errors = action.getError();
            if(state === 'SUCCESS') {
             
                var toastEvent = $A.get("e.force:showToast");
    			toastEvent.setParams({  "title": "Success!",  "message": "The record has been updated successfully."});
   	 			toastEvent.fire();
                
                var returnValue = response.getReturnValue();
          
             var probabilities = returnValue.probabilities;

                var meterWidth =  (probabilities[0].probability *100);
                
                component.set("v.prediction", probabilities[0].label);
                component.set("v.probability", probabilities[0].probability);
                component.set("v.meterWidth", meterWidth + '%');
                component.set("v.fileName", returnValue.original_fileName);
                component.set("v.attachId", returnValue.attachment_id);
                component.set("v.fileType", file.type);
                
            //   var predictionItem = document.getElementById("predictionId");
             //   predictionItem.innerHTML = returnValue.prediction;
                
              //     alert("returnValue.prediction");
              //  var predictionItem = component.find("predictionId");
                //predictionItem.set("v.value", returnValue.prediction);
            } else if(state === 'ERROR') {
             //   component.set("v.message", "Something went wrong " + errors[0].message);
               $A.log("Errors", errors);
                this.handleErrors(errors);
            }
        });
        
        $A.enqueueAction(action); 
        component.set("v.prediction", "Getting prediction...");   
    },
    
    analyseAgain: function(component, base64Data) {
         component.set("v.spinnerWaiting", true);
        var action = component.get("c.analyseImage"); 
        var c_type = component.get("v.modelName");
        var base64 = component.get("v.fileData").match(/,(.*)$/)[1];
        var keyContent = component.get("v.keyContent");
        var email = component.get("v.einsteinAcctEmail");

        action.setParams({
            base64Data: base64,
            modelName: c_type,
            keyContent: keyContent,
            email: email
        });

        action.setCallback(this, function(response) {
            console.log("Callback called");
             component.set("v.spinnerWaiting", false);
            var state = response.getState();
            var errors = action.getError();
            if(state === 'SUCCESS') {
                var returnValue = response.getReturnValue();
                component.set("v.prediction", returnValue.prediction);
                component.set("v.probability", returnValue.prediction_rating);
            } else if(state === 'ERROR') {
               // component.set("v.message", "Something went wrong " + errors[0].message);
                  $A.log("Errors", errors);
                this.handleErrors(errors);
            }
        });      
        $A.enqueueAction(action); 
        component.set("v.prediction", "Getting prediction...");    
    },
    
    createPredictionRecord: function(component){
  
        
         var objectName = component.get("v.objectName");
         var fieldName = component.get("v.fieldName");
        var intentLabel = component.get("v.prediction"); 
         var recordId = component.get("v.recordId"); 
        
       if(objectName == null || objectName.length == 0) {
       	return;
       }
        
       if(fieldName == null || fieldName.length == 0) {
       	return;
       }
          var action = component.get("c.createRecord"); 

        action.setParams({
            recordId: recordId,
            objectName: objectName,
            fieldName: fieldName,
            intentLabel: intentLabel
        });
        
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
                $A.log("Errors", response.getError());
                this.handleErrors(response.getError());
            }
        });
        $A.enqueueAction(action);
        
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

})