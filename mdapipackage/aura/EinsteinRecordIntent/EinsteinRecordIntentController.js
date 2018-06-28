({
	doInit : function(component, event, helper) {
        // component.set('v.cardLabel', 'Einstein Intent');
        
        let action = component.get('c.getRecordAnalysis');
               
        action.setParams({
            recordId: component.get('v.recordId'),
            modelId:  component.get('v.modelId'),
            fieldName: component.get('v.fieldName')
        })
        action.setCallback(this, function(res){
            let state = res.getState();
            let retVal = res.getReturnValue();
       
            if(state === 'SUCCESS'){
              
                if(retVal){
                    component.set('v.predictionList', retVal);
                    component.set('v.hasData', true);
                }
            } else {
                console.log(res.getError());
            }
        })
        
        $A.enqueueAction(action);
        
        /*let action2 = component.get('c.getRecordName');
               
        action2.setParams({
            recordId: component.get('v.recordId'),
           
        })
        
        action2.setCallback(this, function(res){
            let state = res.getState();
            let retVal = res.getReturnValue();
       
            if(state === 'SUCCESS'){
              
                if(retVal){
                     let modelId =  component.get('v.modelId');
                    let einsteinLabel = '';
                    
                    if(modelId == 'CommunitySentiment') {
                        einsteinLabel = 'Sentiment';
                   /} else {
                       einsteinLabel = 'Intent';
                    }
                    let title = retVal + ' '  + einsteinLabel;
                    
                   // component.set('v.cardLabel', title);
                    
                }
            } else {
                this.handleErrors(res.getError());
            } 
        })
        
        $A.enqueueAction(action2); */
    },
    savePrediction : function(component, event, helper) {
        
    	let action = component.get('c.saveIntent');
        
        let predictionList = component.get(' v.predictionList');
        let value = predictionList[0].label;
         console.log('Save Intent ' + value);
        
        action.setParams({
            recordId: component.get('v.recordId'),
            value: value ,
            fieldName: component.get('v.saveToField')
        })
        action.setCallback(this, function(res){
            let state = res.getState();
           // let retVal = res.getReturnValue();
       
            if(state === 'SUCCESS'){
            	   var resultsToast = $A.get("e.force:showToast");
                	resultsToast.setParams({
                        "title": "Success",
                        "message": "Einstein prediction saved successfully."
                    });
					$A.get('e.force:refreshView').fire();
                 	$A.get("e.force:closeQuickAction").fire();
                 	resultsToast.fire();           
            } else {
                this.handleErrors(res.getError());
            }
        })
        
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