({
     getIntent : function(component, event, startPos, controller, lastId) {
         var helper = this;  
		
         var BATCH_SIZE = 80;
         var END_POS = component.get("v.objectCount");
        
         if(startPos > END_POS) {
              return;
         }
         
         var modelId = component.get("v.selectedModel");
         var datasetId = component.get("v.datasetId");
         
         if(modelId == null && datasetId == 'CommunitySentiment') {
             modelId = 'CommunitySentiment';
         }
         
         var sourceName = component.get("v.selectedSourceField");
         var destinationName = component.get("v.selectedDestinationField");
         var objectName = component.get("v.selectedObject");
       
         var overwrite =  component.get("v.overwriteValues"); 
         
        //  console.log("overwrite cmp");
       //  console.log(overwrite);
          
 
        var endPos = startPos + BATCH_SIZE;
        console.log("Sending " + modelId + " " + sourceName  + " " + destinationName + " " + objectName );  
        console.log("Moving to " + startPos + " " + endPos);   
        var action = component.get(controller);
      
         action.setParams({
            modelId : modelId,
            sourceName : sourceName,
            destinationName : destinationName,
            objectName : objectName,
            batchSize : BATCH_SIZE,
             overwriteValues: overwrite,
             latestId: lastId
        });
  
    	action.setCallback(this, function(a) {
            if (a.getState() === "SUCCESS") {
                     
                startPos = endPos;
 
                var objectCount = component.get("v.objectCount");
                var objectsCompleted;
                if(startPos < objectCount)  {
                	objectsCompleted = startPos;
                } else {
                    objectsCompleted = objectCount;
                }
           		var progressPercent = objectsCompleted / objectCount * 100;
                
                 component.set("v.objectsCompleted", objectsCompleted);
                 component.set("v.progressPercent", progressPercent);
                
                let newLastId = a.getReturnValue();
                
                helper.getIntent(component, event, startPos, controller, newLastId);
                
            } else if (a.getState() === "ERROR") {                      
                $A.log("Errors", a.getError());
                this.handleErrors(a.getError());
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